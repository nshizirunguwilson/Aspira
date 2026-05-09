"""Admin comment ORM model — comments and status-change events on a feedback."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AdminCommentEventType(str, enum.Enum):
    comment = "comment"
    status_change = "status_change"


class AdminComment(Base):
    __tablename__ = "admin_comments"

    commentId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    feedbackId: Mapped[int] = mapped_column(ForeignKey("feedback.feedbackId"), nullable=False)
    adminId: Mapped[int] = mapped_column(ForeignKey("admin.adminId"), nullable=False)
    commentText: Mapped[str] = mapped_column(Text, nullable=False)
    eventType: Mapped[AdminCommentEventType] = mapped_column(
        Enum(AdminCommentEventType, name="admin_comment_event_type"),
        default=AdminCommentEventType.comment,
        nullable=False,
    )
    oldStatus: Mapped[str | None] = mapped_column(String(50), nullable=True)
    newStatus: Mapped[str | None] = mapped_column(String(50), nullable=True)
    commentDate: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
