"""add citizen email column

Optional email column on the citizen table so transactional emails
(welcome, feedback confirmation, status updates) have a destination.
Nullable so existing rows from before the column was introduced
continue to work; new registrations populate it.

Revision ID: 20260509_0002
Revises: 20260509_0001
Create Date: 2026-05-09
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260509_0002"
down_revision: str | None = "20260509_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("citizen", sa.Column("email", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("citizen", "email")
