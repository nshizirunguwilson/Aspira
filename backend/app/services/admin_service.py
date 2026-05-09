"""Admin business logic — analytics, feedback management, comments, export."""

import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Annotated, AsyncIterator

from fastapi import Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.admin import Admin
from app.models.admin_comment import AdminComment, AdminCommentEventType
from app.models.citizen import Citizen
from app.models.feedback import Feedback, FeedbackStatus
from app.models.service import Service
from app.utils.email import send_status_update
from app.schemas.admin import (
    AdminActivityEvent,
    AdminStats,
    ServiceStat,
    WeekStat,
)


def _start_of_month(now: datetime) -> datetime:
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


class AdminService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def stats(self) -> AdminStats:
        now = datetime.now(timezone.utc)

        total = (
            await self.db.execute(select(func.count(Feedback.feedbackId)))
        ).scalar_one()
        open_count = (
            await self.db.execute(
                select(func.count(Feedback.feedbackId)).where(
                    Feedback.status.in_(
                        [FeedbackStatus.pending, FeedbackStatus.in_progress]
                    )
                )
            )
        ).scalar_one()

        month_start = _start_of_month(now)
        last_month_start = _start_of_month(month_start - timedelta(days=1))

        resolved_this_month = (
            await self.db.execute(
                select(func.count(Feedback.feedbackId)).where(
                    Feedback.status == FeedbackStatus.solved,
                    Feedback.updatedAt >= month_start,
                )
            )
        ).scalar_one()

        submissions_this_month = (
            await self.db.execute(
                select(func.count(Feedback.feedbackId)).where(
                    Feedback.date >= month_start
                )
            )
        ).scalar_one()
        submissions_last_month = (
            await self.db.execute(
                select(func.count(Feedback.feedbackId)).where(
                    Feedback.date >= last_month_start,
                    Feedback.date < month_start,
                )
            )
        ).scalar_one()

        if submissions_last_month == 0:
            change_vs_last_month = 100.0 if submissions_this_month else 0.0
        else:
            change_vs_last_month = (
                (submissions_this_month - submissions_last_month)
                / submissions_last_month
                * 100
            )

        # First admin response per feedback → average hours.
        first_response_subq = (
            select(
                AdminComment.feedbackId.label("fid"),
                func.min(AdminComment.commentDate).label("first_response"),
            )
            .group_by(AdminComment.feedbackId)
            .subquery()
        )
        avg_response_hours_row = await self.db.execute(
            select(
                func.avg(
                    (
                        func.unix_timestamp(first_response_subq.c.first_response)
                        - func.unix_timestamp(Feedback.date)
                    )
                    / 3600.0
                )
            ).join(first_response_subq, first_response_subq.c.fid == Feedback.feedbackId)
        )
        avg_response_hours = float(avg_response_hours_row.scalar() or 0.0)

        # Per-service breakdown.
        by_service_rows = (
            await self.db.execute(
                select(
                    Service.serviceId,
                    Service.serviceName,
                    func.count(Feedback.feedbackId).label("count"),
                )
                .join(Feedback, Feedback.serviceId == Service.serviceId, isouter=True)
                .group_by(Service.serviceId, Service.serviceName)
                .order_by(func.count(Feedback.feedbackId).desc())
            )
        ).all()
        submissions_by_service = [
            ServiceStat(service_id=sid, service_name=name, count=count)
            for sid, name, count in by_service_rows
        ]

        # Last 12 weeks histogram (ISO weeks).
        twelve_weeks_ago = now - timedelta(weeks=12)
        weekly_rows = (
            await self.db.execute(
                select(
                    func.yearweek(Feedback.date, 3).label("yw"),
                    func.min(Feedback.date).label("week_start"),
                    func.count(Feedback.feedbackId).label("count"),
                )
                .where(Feedback.date >= twelve_weeks_ago)
                .group_by(func.yearweek(Feedback.date, 3))
                .order_by(func.yearweek(Feedback.date, 3))
            )
        ).all()
        submissions_by_week = [
            WeekStat(
                week_start=week_start,
                label=week_start.strftime("%b %d"),
                count=count,
            )
            for _yw, week_start, count in weekly_rows
        ]

        return AdminStats(
            total_submissions=total,
            open_issues=open_count,
            resolved_this_month=resolved_this_month,
            avg_response_hours=round(avg_response_hours, 1),
            submissions_by_service=submissions_by_service,
            submissions_by_week=submissions_by_week,
            change_vs_last_month=round(change_vs_last_month, 1),
        )

    async def update_status(
        self,
        feedback_id: int,
        new_status: FeedbackStatus,
        comment_text: str,
        admin: Admin,
    ) -> Feedback:
        feedback = await self.db.get(Feedback, feedback_id)
        if feedback is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found"
            )
        old = feedback.status
        if old == new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status is already set to this value",
            )

        feedback.status = new_status
        self.db.add(
            AdminComment(
                feedbackId=feedback_id,
                adminId=admin.adminId,
                commentText=comment_text.strip(),
                eventType=AdminCommentEventType.status_change,
                oldStatus=old.value,
                newStatus=new_status.value,
            )
        )
        await self.db.commit()
        await self.db.refresh(feedback)

        citizen = await self.db.get(Citizen, feedback.citizenId)
        if citizen is not None:
            send_status_update(
                citizen.email,
                citizen.fullName,
                feedback.feedbackId,
                new_status.value,
                comment_text.strip(),
            )
        return feedback

    async def add_comment(
        self, feedback_id: int, comment_text: str, admin: Admin
    ) -> AdminComment:
        feedback = await self.db.get(Feedback, feedback_id)
        if feedback is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found"
            )
        comment = AdminComment(
            feedbackId=feedback_id,
            adminId=admin.adminId,
            commentText=comment_text.strip(),
            eventType=AdminCommentEventType.comment,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def recent_activity(self, limit: int = 10) -> list[AdminActivityEvent]:
        rows = (
            await self.db.execute(
                select(
                    AdminComment, Service.serviceName, Feedback.location
                )
                .join(Feedback, Feedback.feedbackId == AdminComment.feedbackId)
                .join(Service, Service.serviceId == Feedback.serviceId)
                .order_by(AdminComment.commentDate.desc(), AdminComment.commentId.desc())
                .limit(limit)
            )
        ).all()
        events: list[AdminActivityEvent] = []
        for comment, service_name, location in rows:
            if comment.eventType == AdminCommentEventType.status_change:
                description = (
                    f"#FB-{comment.feedbackId:05d} status changed to "
                    f"{comment.newStatus or 'updated'}"
                )
                event_type = "status_change"
            else:
                description = f"#FB-{comment.feedbackId:05d} comment added"
                event_type = "comment"
            events.append(
                AdminActivityEvent(
                    event_id=comment.commentId,
                    feedback_id=comment.feedbackId,
                    service_name=service_name,
                    location=location,
                    description=description,
                    event_type=event_type,  # type: ignore[arg-type]
                    new_status=comment.newStatus,
                    created_at=comment.commentDate,
                )
            )
        return events

    async def export_csv_stream(self) -> AsyncIterator[bytes]:
        """Stream a CSV of every feedback row for download."""
        result = await self.db.execute(
            select(Feedback, Service.serviceName)
            .join(Service, Service.serviceId == Feedback.serviceId)
            .order_by(Feedback.date.asc())
        )

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            [
                "feedback_id",
                "service",
                "location",
                "frequency",
                "status",
                "upvotes",
                "submitted_at",
                "feedback_text",
            ]
        )
        yield buffer.getvalue().encode("utf-8")
        buffer.seek(0)
        buffer.truncate()

        for fb, service_name in result.all():
            writer.writerow(
                [
                    f"FB-{fb.feedbackId:05d}",
                    service_name,
                    fb.location,
                    fb.frequency.value,
                    fb.status.value,
                    fb.upVotes,
                    fb.date.isoformat(),
                    fb.feedbackText.replace("\n", " "),
                ]
            )
            chunk = buffer.getvalue().encode("utf-8")
            buffer.seek(0)
            buffer.truncate()
            yield chunk

async def get_admin_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminService:
    return AdminService(db)


__all__ = ["AdminService", "get_admin_service"]
