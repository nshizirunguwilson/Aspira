"""Feedback upvote ORM model — one row per (feedback, citizen) pair."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FeedbackUpvote(Base):
    __tablename__ = "feedback_upvotes"
    __table_args__ = (UniqueConstraint("feedbackId", "citizenId", name="unique_upvote"),)

    upvoteId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    feedbackId: Mapped[int] = mapped_column(ForeignKey("feedback.feedbackId"), nullable=False)
    citizenId: Mapped[int] = mapped_column(ForeignKey("citizen.citizenId"), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
