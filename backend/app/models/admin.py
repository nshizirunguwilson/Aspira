"""Admin ORM model."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AdminRole(str, enum.Enum):
    super_admin = "super_admin"
    service_admin = "service_admin"


class Admin(Base):
    __tablename__ = "admin"

    adminId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[AdminRole] = mapped_column(
        Enum(AdminRole, name="admin_role"),
        default=AdminRole.service_admin,
        nullable=False,
    )
    createdAt: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False
    )
