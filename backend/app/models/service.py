"""Public service catalog ORM model."""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Service(Base):
    __tablename__ = "services"

    serviceId: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    serviceName: Mapped[str] = mapped_column(String(255), nullable=False)
    iconName: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
