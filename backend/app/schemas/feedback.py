"""Pydantic schemas for feedback resources."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    service_id: int
    location: str = Field(min_length=1, max_length=255)
    frequency: Literal["once", "weekly", "daily", "ongoing"]
    feedback_text: str = Field(min_length=20, max_length=1000)
    attachment_urls: list[str] = Field(default_factory=list, max_length=3)
    """Cloudinary URLs uploaded directly from the browser (phase 5)."""


class FeedbackItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id: int
    service_id: int
    service_name: str
    location: str
    frequency: Literal["once", "weekly", "daily", "ongoing"]
    feedback_text: str
    status: Literal["pending", "in_progress", "solved", "cancelled"]
    upvotes: int
    upvoted_by_me: bool = False
    date: datetime
    attachment_urls: list[str] = Field(default_factory=list)
    citizen_id: int


class TimelineEvent(BaseModel):
    event_id: int
    event_type: Literal["submission", "comment", "status_change"]
    description: str
    comment_text: str | None = None
    old_status: str | None = None
    new_status: str | None = None
    admin_username: str | None = None
    created_at: datetime


class FeedbackDetail(FeedbackItem):
    timeline: list[TimelineEvent] = Field(default_factory=list)


class FeedbackListResponse(BaseModel):
    items: list[FeedbackItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class UpvoteResponse(BaseModel):
    upvotes: int
    upvoted: bool
