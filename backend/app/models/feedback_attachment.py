"""Feedback attachment ORM model (Cloudinary references)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FeedbackAttachment(Base):
    __tablename__ = "feedback_attachments"

    attachmentId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    feedbackId: Mapped[int] = mapped_column(
        ForeignKey("feedback.feedbackId", ondelete="CASCADE"), nullable=False
    )
    cloudinaryUrl: Mapped[str] = mapped_column(String(1000), nullable=False)
    cloudinaryId: Mapped[str] = mapped_column(String(500), nullable=False)
    fileType: Mapped[str | None] = mapped_column(String(50), nullable=True)
    uploadedAt: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
