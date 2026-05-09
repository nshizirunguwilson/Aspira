"""Feedback ORM model."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FeedbackFrequency(str, enum.Enum):
    once = "once"
    weekly = "weekly"
    daily = "daily"
    ongoing = "ongoing"


class FeedbackStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    solved = "solved"
    cancelled = "cancelled"


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        Index("idx_status", "status"),
        Index("idx_service", "serviceId"),
        Index("idx_upvotes", "upVotes"),
        Index("idx_date", "date"),
    )

    feedbackId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    citizenId: Mapped[int] = mapped_column(ForeignKey("citizen.citizenId"), nullable=False)
    serviceId: Mapped[int] = mapped_column(ForeignKey("services.serviceId"), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    frequency: Mapped[FeedbackFrequency] = mapped_column(
        Enum(FeedbackFrequency, name="feedback_frequency"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
    feedbackText: Mapped[str] = mapped_column(Text, nullable=False)
    upVotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[FeedbackStatus] = mapped_column(
        Enum(FeedbackStatus, name="feedback_status"),
        default=FeedbackStatus.pending,
        nullable=False,
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=False,
    )
