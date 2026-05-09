"""Admin-only routes."""

from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.middleware.auth import get_current_admin
from app.models.admin import Admin
from app.models.feedback import FeedbackStatus
from app.schemas.admin import (
    AdminActivityEvent,
    AdminCommentCreate,
    AdminCommentItem,
    AdminStats,
    AdminStatusUpdate,
)
from app.schemas.feedback import (
    FeedbackDetail,
    FeedbackItem,
    FeedbackListResponse,
)
from app.services.admin_service import AdminService, get_admin_service
from app.services.feedback_service import FeedbackService, get_feedback_service

router = APIRouter()


@router.get("/feedback", response_model=FeedbackListResponse)
async def list_feedback(
    _admin: Annotated[Admin, Depends(get_current_admin)],
    feedback: Annotated[FeedbackService, Depends(get_feedback_service)],
    service_id: int | None = None,
    status_filter: Annotated[FeedbackStatus | None, Query(alias="status")] = None,
    search: str | None = None,
    sort_by: Literal["upvotes", "date"] = "date",
    page: int = 1,
    per_page: int = 25,
) -> FeedbackListResponse:
    return await feedback.list_feedback(
        viewer_citizen_id=None,
        service_id=service_id,
        status_filter=status_filter,
        search=search,
        sort_by=sort_by,
        page=page,
        per_page=per_page,
    )


@router.get("/feedback/export")
async def export_feedback_csv(
    _admin: Annotated[Admin, Depends(get_current_admin)],
    admin: Annotated[AdminService, Depends(get_admin_service)],
) -> StreamingResponse:
    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    return StreamingResponse(
        admin.export_csv_stream(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="aspira-feedback-{timestamp}.csv"',
        },
    )


@router.get("/feedback/{feedback_id}", response_model=FeedbackDetail)
async def get_feedback(
    feedback_id: int,
    _admin: Annotated[Admin, Depends(get_current_admin)],
    feedback: Annotated[FeedbackService, Depends(get_feedback_service)],
) -> FeedbackDetail:
    return await feedback.get_detail(feedback_id, viewer_citizen_id=None)


@router.patch(
    "/feedback/{feedback_id}/status",
    response_model=FeedbackItem,
)
async def update_status(
    feedback_id: int,
    payload: AdminStatusUpdate,
    admin_user: Annotated[Admin, Depends(get_current_admin)],
    admin: Annotated[AdminService, Depends(get_admin_service)],
    feedback: Annotated[FeedbackService, Depends(get_feedback_service)],
) -> FeedbackItem:
    await admin.update_status(
        feedback_id,
        FeedbackStatus(payload.status),
        payload.comment,
        admin_user,
    )
    detail = await feedback.get_detail(feedback_id, viewer_citizen_id=None)
    return FeedbackItem(**detail.model_dump(exclude={"timeline"}))


@router.post(
    "/feedback/{feedback_id}/comment",
    response_model=AdminCommentItem,
)
async def add_comment(
    feedback_id: int,
    payload: AdminCommentCreate,
    admin_user: Annotated[Admin, Depends(get_current_admin)],
    admin: Annotated[AdminService, Depends(get_admin_service)],
) -> AdminCommentItem:
    comment = await admin.add_comment(feedback_id, payload.comment_text, admin_user)
    return AdminCommentItem(
        comment_id=comment.commentId,
        feedback_id=comment.feedbackId,
        admin_username=admin_user.username,
        comment_text=comment.commentText,
        event_type="comment",
        old_status=None,
        new_status=None,
        created_at=comment.commentDate,
    )


@router.get("/stats", response_model=AdminStats)
async def stats(
    _admin: Annotated[Admin, Depends(get_current_admin)],
    admin: Annotated[AdminService, Depends(get_admin_service)],
) -> AdminStats:
    return await admin.stats()


@router.get("/activity", response_model=list[AdminActivityEvent])
async def recent_activity(
    _admin: Annotated[Admin, Depends(get_current_admin)],
    admin: Annotated[AdminService, Depends(get_admin_service)],
) -> list[AdminActivityEvent]:
    return await admin.recent_activity()
