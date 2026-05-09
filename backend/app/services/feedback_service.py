"""Feedback business logic — list, detail, create, upvote toggle, citizen mine."""

import math
from datetime import datetime
from typing import Annotated, Literal

from fastapi import Depends, HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.admin import Admin
from app.models.admin_comment import AdminComment, AdminCommentEventType
from app.models.citizen import Citizen
from app.models.feedback import Feedback, FeedbackFrequency, FeedbackStatus
from app.models.feedback_attachment import FeedbackAttachment
from app.models.feedback_upvote import FeedbackUpvote
from app.models.service import Service
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackDetail,
    FeedbackItem,
    FeedbackListResponse,
    TimelineEvent,
)
from app.utils.email import send_feedback_confirmation


def _to_item(
    fb: Feedback,
    service_name: str,
    upvoted_by_me: bool,
    attachment_urls: list[str],
) -> FeedbackItem:
    return FeedbackItem(
        feedback_id=fb.feedbackId,
        service_id=fb.serviceId,
        service_name=service_name,
        location=fb.location,
        frequency=fb.frequency.value,
        feedback_text=fb.feedbackText,
        status=fb.status.value,
        upvotes=fb.upVotes,
        upvoted_by_me=upvoted_by_me,
        date=fb.date,
        attachment_urls=attachment_urls,
        citizen_id=fb.citizenId,
    )


class FeedbackService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _attachments_for(self, feedback_ids: list[int]) -> dict[int, list[str]]:
        if not feedback_ids:
            return {}
        result = await self.db.execute(
            select(FeedbackAttachment).where(
                FeedbackAttachment.feedbackId.in_(feedback_ids)
            )
        )
        out: dict[int, list[str]] = {fid: [] for fid in feedback_ids}
        for att in result.scalars().all():
            out[att.feedbackId].append(att.cloudinaryUrl)
        return out

    async def _upvoted_by(
        self, citizen_id: int | None, feedback_ids: list[int]
    ) -> set[int]:
        if not citizen_id or not feedback_ids:
            return set()
        result = await self.db.execute(
            select(FeedbackUpvote.feedbackId).where(
                and_(
                    FeedbackUpvote.citizenId == citizen_id,
                    FeedbackUpvote.feedbackId.in_(feedback_ids),
                )
            )
        )
        return {row[0] for row in result.all()}

    async def list_feedback(
        self,
        *,
        viewer_citizen_id: int | None,
        service_id: int | None,
        status_filter: FeedbackStatus | None,
        search: str | None,
        sort_by: Literal["upvotes", "date"],
        page: int,
        per_page: int,
    ) -> FeedbackListResponse:
        page = max(page, 1)
        per_page = max(min(per_page, 100), 1)

        conditions = []
        if service_id is not None:
            conditions.append(Feedback.serviceId == service_id)
        if status_filter is not None:
            conditions.append(Feedback.status == status_filter)
        if search:
            needle = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Feedback.feedbackText.ilike(needle),
                    Feedback.location.ilike(needle),
                )
            )

        base_query = select(Feedback, Service.serviceName).join(
            Service, Service.serviceId == Feedback.serviceId
        )
        if conditions:
            base_query = base_query.where(*conditions)

        order = (
            Feedback.upVotes.desc()
            if sort_by == "upvotes"
            else Feedback.date.desc()
        )
        rows_query = (
            base_query.order_by(order, Feedback.feedbackId.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        rows = (await self.db.execute(rows_query)).all()

        count_query = select(func.count(Feedback.feedbackId))
        if conditions:
            count_query = count_query.where(*conditions)
        total = (await self.db.execute(count_query)).scalar_one()

        feedback_ids = [fb.feedbackId for fb, _ in rows]
        attachments = await self._attachments_for(feedback_ids)
        upvoted_set = await self._upvoted_by(viewer_citizen_id, feedback_ids)

        items = [
            _to_item(
                fb,
                service_name=name,
                upvoted_by_me=fb.feedbackId in upvoted_set,
                attachment_urls=attachments.get(fb.feedbackId, []),
            )
            for fb, name in rows
        ]

        return FeedbackListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=max(math.ceil(total / per_page), 1) if total else 0,
        )

    async def get_detail(
        self,
        feedback_id: int,
        viewer_citizen_id: int | None,
    ) -> FeedbackDetail:
        result = await self.db.execute(
            select(Feedback, Service.serviceName)
            .join(Service, Service.serviceId == Feedback.serviceId)
            .where(Feedback.feedbackId == feedback_id)
        )
        row = result.first()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found"
            )
        fb, service_name = row

        attachments = (await self._attachments_for([fb.feedbackId])).get(fb.feedbackId, [])
        upvoted = bool(await self._upvoted_by(viewer_citizen_id, [fb.feedbackId]))

        timeline = [
            TimelineEvent(
                event_id=0,
                event_type="submission",
                description="Feedback submitted",
                created_at=fb.date,
            )
        ]

        comment_rows = await self.db.execute(
            select(AdminComment, Admin.username)
            .join(Admin, Admin.adminId == AdminComment.adminId)
            .where(AdminComment.feedbackId == fb.feedbackId)
            .order_by(AdminComment.commentDate.asc(), AdminComment.commentId.asc())
        )
        for comment, username in comment_rows.all():
            if comment.eventType == AdminCommentEventType.status_change:
                description = (
                    f"Status updated to {comment.newStatus}"
                    if comment.newStatus
                    else "Status updated"
                )
                event_type: Literal["submission", "comment", "status_change"] = (
                    "status_change"
                )
            else:
                description = "Admin comment"
                event_type = "comment"
            timeline.append(
                TimelineEvent(
                    event_id=comment.commentId,
                    event_type=event_type,
                    description=description,
                    comment_text=comment.commentText,
                    old_status=comment.oldStatus,
                    new_status=comment.newStatus,
                    admin_username=username,
                    created_at=comment.commentDate,
                )
            )

        item = _to_item(fb, service_name, upvoted, attachments)
        return FeedbackDetail(**item.model_dump(), timeline=timeline)

    async def create_feedback(
        self, citizen_id: int, data: FeedbackCreate
    ) -> FeedbackItem:
        service = await self.db.get(Service, data.service_id)
        if service is None or not service.isActive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unknown or inactive service",
            )

        feedback = Feedback(
            citizenId=citizen_id,
            serviceId=data.service_id,
            location=data.location.strip(),
            frequency=FeedbackFrequency(data.frequency),
            feedbackText=data.feedback_text.strip(),
        )
        self.db.add(feedback)
        await self.db.flush()

        for url in data.attachment_urls:
            self.db.add(
                FeedbackAttachment(
                    feedbackId=feedback.feedbackId,
                    cloudinaryUrl=url,
                    cloudinaryId=url.rsplit("/", 1)[-1],
                )
            )

        await self.db.commit()
        await self.db.refresh(feedback)

        citizen = await self.db.get(Citizen, citizen_id)
        if citizen is not None:
            send_feedback_confirmation(
                citizen.email,
                citizen.fullName,
                feedback.feedbackId,
                service.serviceName,
            )

        return _to_item(
            feedback,
            service_name=service.serviceName,
            upvoted_by_me=False,
            attachment_urls=list(data.attachment_urls),
        )

    async def toggle_upvote(self, feedback_id: int, citizen_id: int) -> tuple[int, bool]:
        feedback = await self.db.get(Feedback, feedback_id)
        if feedback is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found"
            )

        existing = await self.db.execute(
            select(FeedbackUpvote).where(
                and_(
                    FeedbackUpvote.feedbackId == feedback_id,
                    FeedbackUpvote.citizenId == citizen_id,
                )
            )
        )
        record = existing.scalar_one_or_none()

        if record is None:
            self.db.add(
                FeedbackUpvote(feedbackId=feedback_id, citizenId=citizen_id)
            )
            try:
                await self.db.flush()
            except IntegrityError:
                # Race condition: another request beat us to the insert.
                await self.db.rollback()
                return feedback.upVotes, True
            feedback.upVotes += 1
            upvoted = True
        else:
            await self.db.delete(record)
            feedback.upVotes = max(feedback.upVotes - 1, 0)
            upvoted = False

        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback.upVotes, upvoted

    async def list_for_citizen(self, citizen_id: int) -> list[FeedbackDetail]:
        result = await self.db.execute(
            select(Feedback, Service.serviceName)
            .join(Service, Service.serviceId == Feedback.serviceId)
            .where(Feedback.citizenId == citizen_id)
            .order_by(Feedback.date.desc())
        )
        rows = result.all()
        if not rows:
            return []

        feedback_ids = [fb.feedbackId for fb, _ in rows]
        attachments = await self._attachments_for(feedback_ids)

        details: list[FeedbackDetail] = []
        for fb, service_name in rows:
            base = _to_item(
                fb,
                service_name=service_name,
                upvoted_by_me=False,
                attachment_urls=attachments.get(fb.feedbackId, []),
            )
            details.append(FeedbackDetail(**base.model_dump(), timeline=[]))
        return details


async def get_feedback_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FeedbackService:
    return FeedbackService(db)


__all__ = ["FeedbackService", "get_feedback_service"]
