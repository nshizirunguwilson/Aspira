"""Citizen ORM model."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Citizen(Base):
    __tablename__ = "citizen"

    citizenId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    fullName: Mapped[str] = mapped_column(String(255), nullable=False)
    phoneNumber: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    idNumber: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=False,
    )
    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
