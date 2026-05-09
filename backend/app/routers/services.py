"""Public services catalog routes."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceItem

router = APIRouter()


@router.get("", response_model=list[ServiceItem])
async def list_services(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ServiceItem]:
    result = await db.execute(
        select(Service).where(Service.isActive == True).order_by(Service.sortOrder)  # noqa: E712
    )
    return [ServiceItem.model_validate(row) for row in result.scalars().all()]
