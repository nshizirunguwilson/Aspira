"""initial schema

Creates the full Aspira web schema from scratch and seeds the services
catalog. The legacy CLI used a subset of these tables with a few
different columns; before applying this migration against the live Aiven
database, operators must:

    mysqldump -h HOST -P PORT -u USER -p Aspira > aspira_backup_$(date +%Y%m%d).sql

then drop the legacy tables (citizen, admin, services, feedback,
comments) so this migration can recreate them with the extended shape
defined in section 13 of the spec.

Revision ID: 20260509_0001
Revises:
Create Date: 2026-05-09
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260509_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "citizen",
        sa.Column("citizenId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("fullName", sa.String(255), nullable=False),
        sa.Column("phoneNumber", sa.String(20), nullable=False, unique=True),
        sa.Column("idNumber", sa.String(50), nullable=False, unique=True),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column(
            "createdAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.Column(
            "updatedAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            server_onupdate=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.Column("isActive", sa.Boolean, nullable=False, server_default=sa.true()),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "admin",
        sa.Column("adminId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("super_admin", "service_admin", name="admin_role"),
            nullable=False,
            server_default="service_admin",
        ),
        sa.Column(
            "createdAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "services",
        sa.Column("serviceId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("serviceName", sa.String(255), nullable=False),
        sa.Column("iconName", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("isActive", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("sortOrder", sa.Integer, nullable=False, server_default="0"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "feedback",
        sa.Column("feedbackId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "citizenId",
            sa.Integer,
            sa.ForeignKey("citizen.citizenId"),
            nullable=False,
        ),
        sa.Column(
            "serviceId",
            sa.Integer,
            sa.ForeignKey("services.serviceId"),
            nullable=False,
        ),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column(
            "frequency",
            sa.Enum("once", "weekly", "daily", "ongoing", name="feedback_frequency"),
            nullable=False,
        ),
        sa.Column(
            "date",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.Column("feedbackText", sa.Text, nullable=False),
        sa.Column("upVotes", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "in_progress",
                "solved",
                "cancelled",
                name="feedback_status",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "updatedAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            server_onupdate=sa.func.current_timestamp(),
            nullable=False,
        ),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("idx_status", "feedback", ["status"])
    op.create_index("idx_service", "feedback", ["serviceId"])
    op.create_index("idx_upvotes", "feedback", ["upVotes"])
    op.create_index("idx_date", "feedback", ["date"])
    op.execute(
        "CREATE FULLTEXT INDEX idx_fulltext ON feedback (feedbackText, location)"
    )

    op.create_table(
        "feedback_attachments",
        sa.Column("attachmentId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "feedbackId",
            sa.Integer,
            sa.ForeignKey("feedback.feedbackId", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("cloudinaryUrl", sa.String(1000), nullable=False),
        sa.Column("cloudinaryId", sa.String(500), nullable=False),
        sa.Column("fileType", sa.String(50), nullable=True),
        sa.Column(
            "uploadedAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "feedback_upvotes",
        sa.Column("upvoteId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "feedbackId",
            sa.Integer,
            sa.ForeignKey("feedback.feedbackId"),
            nullable=False,
        ),
        sa.Column(
            "citizenId",
            sa.Integer,
            sa.ForeignKey("citizen.citizenId"),
            nullable=False,
        ),
        sa.Column(
            "createdAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.UniqueConstraint("feedbackId", "citizenId", name="unique_upvote"),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "admin_comments",
        sa.Column("commentId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "feedbackId",
            sa.Integer,
            sa.ForeignKey("feedback.feedbackId"),
            nullable=False,
        ),
        sa.Column(
            "adminId",
            sa.Integer,
            sa.ForeignKey("admin.adminId"),
            nullable=False,
        ),
        sa.Column("commentText", sa.Text, nullable=False),
        sa.Column(
            "eventType",
            sa.Enum(
                "comment", "status_change", name="admin_comment_event_type"
            ),
            nullable=False,
            server_default="comment",
        ),
        sa.Column("oldStatus", sa.String(50), nullable=True),
        sa.Column("newStatus", sa.String(50), nullable=True),
        sa.Column(
            "commentDate",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("tokenId", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "userType",
            sa.Enum("citizen", "admin", name="token_user_type"),
            nullable=False,
        ),
        sa.Column("userId", sa.Integer, nullable=False),
        sa.Column("tokenHash", sa.String(255), nullable=False, unique=True),
        sa.Column("expiresAt", sa.DateTime, nullable=False),
        sa.Column(
            "createdAt",
            sa.DateTime,
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.Column("isRevoked", sa.Boolean, nullable=False, server_default=sa.false()),
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )

    # Seed the public service catalog.
    op.bulk_insert(
        sa.table(
            "services",
            sa.column("serviceName", sa.String),
            sa.column("iconName", sa.String),
            sa.column("description", sa.Text),
            sa.column("sortOrder", sa.Integer),
        ),
        [
            {"serviceName": "Road Maintenance", "iconName": "Construction",
             "description": "Potholes, road damage, traffic infrastructure", "sortOrder": 1},
            {"serviceName": "Water & Sanitation", "iconName": "Droplets",
             "description": "Water supply, drainage, sewage", "sortOrder": 2},
            {"serviceName": "Electricity", "iconName": "Zap",
             "description": "Power outages, electrical infrastructure", "sortOrder": 3},
            {"serviceName": "Healthcare", "iconName": "Stethoscope",
             "description": "Public hospitals, clinics, health services", "sortOrder": 4},
            {"serviceName": "Education", "iconName": "GraduationCap",
             "description": "Public schools, educational facilities", "sortOrder": 5},
            {"serviceName": "Waste Management", "iconName": "Trash2",
             "description": "Garbage collection, public cleanliness", "sortOrder": 6},
            {"serviceName": "Public Transport", "iconName": "Bus",
             "description": "Bus routes, transport infrastructure", "sortOrder": 7},
            {"serviceName": "Street Lighting", "iconName": "Lightbulb",
             "description": "Street lights, public area lighting", "sortOrder": 8},
            {"serviceName": "Public Safety", "iconName": "Shield",
             "description": "Police, emergency services, public order", "sortOrder": 9},
            {"serviceName": "Other", "iconName": "HelpCircle",
             "description": "Any other public service issue", "sortOrder": 10},
        ],
    )


def downgrade() -> None:
    op.drop_table("refresh_tokens")
    op.drop_table("admin_comments")
    op.drop_table("feedback_upvotes")
    op.drop_table("feedback_attachments")
    op.execute("DROP INDEX idx_fulltext ON feedback")
    op.drop_index("idx_date", table_name="feedback")
    op.drop_index("idx_upvotes", table_name="feedback")
    op.drop_index("idx_service", table_name="feedback")
    op.drop_index("idx_status", table_name="feedback")
    op.drop_table("feedback")
    op.drop_table("services")
    op.drop_table("admin")
    op.drop_table("citizen")
    # Drop named ENUMs (no-op on MySQL — ENUMs are inline column types).
