"""Feedback routes — list, detail, create, upvote, citizen mine."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_citizen, get_optional_user
from app.middleware.rate_limit import LIMIT_UPVOTE, limiter
from app.models.admin import Admin
from app.models.citizen import Citizen
from app.models.feedback import FeedbackStatus
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackDetail,
    FeedbackItem,
    FeedbackListResponse,
    UpvoteResponse,
)
from app.services.feedback_service import FeedbackService, get_feedback_service

router = APIRouter()


def _viewer_id(user: Citizen | Admin | None) -> int | None:
    if isinstance(user, Citizen):
        return user.citizenId
    return None


@router.get("", response_model=FeedbackListResponse)
async def list_feedback(
    svc: Annotated[FeedbackService, Depends(get_feedback_service)],
    viewer: Annotated[Citizen | Admin | None, Depends(get_optional_user)],
    service_id: int | None = None,
    status_filter: Annotated[FeedbackStatus | None, Query(alias="status")] = None,
    search: str | None = None,
    sort_by: Literal["upvotes", "date"] = "upvotes",
    page: int = 1,
    per_page: int = 12,
) -> FeedbackListResponse:
    return await svc.list_feedback(
        viewer_citizen_id=_viewer_id(viewer),
        service_id=service_id,
        status_filter=status_filter,
        search=search,
        sort_by=sort_by,
        page=page,
        per_page=per_page,
    )


@router.get("/citizen/mine", response_model=list[FeedbackDetail])
async def list_my_feedback(
    citizen: Annotated[Citizen, Depends(get_current_citizen)],
    svc: Annotated[FeedbackService, Depends(get_feedback_service)],
) -> list[FeedbackDetail]:
    return await svc.list_for_citizen(citizen.citizenId)


@router.get("/{feedback_id}", response_model=FeedbackDetail)
async def get_feedback(
    feedback_id: int,
    svc: Annotated[FeedbackService, Depends(get_feedback_service)],
    viewer: Annotated[Citizen | Admin | None, Depends(get_optional_user)],
) -> FeedbackDetail:
    return await svc.get_detail(feedback_id, _viewer_id(viewer))


@router.post(
    "",
    response_model=FeedbackItem,
    status_code=status.HTTP_201_CREATED,
)
async def create_feedback(
    payload: FeedbackCreate,
    citizen: Annotated[Citizen, Depends(get_current_citizen)],
    svc: Annotated[FeedbackService, Depends(get_feedback_service)],
) -> FeedbackItem:
    return await svc.create_feedback(citizen.citizenId, payload)


@router.post("/{feedback_id}/upvote", response_model=UpvoteResponse)
@limiter.limit(LIMIT_UPVOTE)
async def upvote(
    request: Request,
    feedback_id: int,
    citizen: Annotated[Citizen, Depends(get_current_citizen)],
    svc: Annotated[FeedbackService, Depends(get_feedback_service)],
) -> UpvoteResponse:
    upvotes, upvoted = await svc.toggle_upvote(feedback_id, citizen.citizenId)
    return UpvoteResponse(upvotes=upvotes, upvoted=upvoted)
