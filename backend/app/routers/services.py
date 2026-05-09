"""Public services catalog routes — implemented in phase 2."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_services() -> list[dict]:
    """Stub — returns an empty list until the services router is fleshed out."""
    return []
