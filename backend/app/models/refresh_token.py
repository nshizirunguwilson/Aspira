"""Refresh token ORM model — one row per issued refresh token."""

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TokenUserType(str, enum.Enum):
    citizen = "citizen"
    admin = "admin"


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    tokenId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userType: Mapped[TokenUserType] = mapped_column(
        Enum(TokenUserType, name="token_user_type"), nullable=False
    )
    userId: Mapped[int] = mapped_column(Integer, nullable=False)
    tokenHash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expiresAt: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
    isRevoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
