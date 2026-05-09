"""SQLAlchemy ORM models for Aspira.

Importing this package registers every model on Base.metadata so Alembic's
autogenerate can see them.
"""

from app.models.admin import Admin
from app.models.admin_comment import AdminComment
from app.models.citizen import Citizen
from app.models.feedback import Feedback
from app.models.feedback_attachment import FeedbackAttachment
from app.models.feedback_upvote import FeedbackUpvote
from app.models.refresh_token import RefreshToken
from app.models.service import Service

__all__ = [
    "Admin",
    "AdminComment",
    "Citizen",
    "Feedback",
    "FeedbackAttachment",
    "FeedbackUpvote",
    "RefreshToken",
    "Service",
]
