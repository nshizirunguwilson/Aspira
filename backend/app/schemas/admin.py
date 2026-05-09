"""Pydantic schemas for admin-only endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AdminStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "solved", "cancelled"]
    comment: str = Field(min_length=20, max_length=2000)


class AdminCommentCreate(BaseModel):
    comment_text: str = Field(min_length=5, max_length=2000)


class AdminCommentItem(BaseModel):
    comment_id: int
    feedback_id: int
    admin_username: str
    comment_text: str
    event_type: Literal["comment", "status_change"]
    old_status: str | None = None
    new_status: str | None = None
    created_at: datetime


class ServiceStat(BaseModel):
    service_id: int
    service_name: str
    count: int


class WeekStat(BaseModel):
    week_start: datetime
    label: str
    count: int


class AdminStats(BaseModel):
    total_submissions: int
    open_issues: int
    resolved_this_month: int
    avg_response_hours: float
    submissions_by_service: list[ServiceStat]
    submissions_by_week: list[WeekStat]
    change_vs_last_month: float


class AdminActivityEvent(BaseModel):
    event_id: int
    feedback_id: int
    service_name: str
    location: str
    description: str
    event_type: Literal["comment", "status_change"]
    new_status: str | None = None
    created_at: datetime
