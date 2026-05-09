"""Auth dependencies for FastAPI routes.

Reads the access_token cookie (or `Authorization: Bearer …` header as a
fallback for tooling), decodes it, loads the user, and yields it. Three
flavours: required-citizen, required-admin, and optional (for endpoints
that show extra fields when authenticated but work for anonymous users).
"""

from typing import Annotated

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.admin import Admin
from app.models.citizen import Citizen
from app.utils.security import JWTError, decode_token


def _extract_token(
    cookie_token: str | None,
    auth_header: str | None,
) -> str | None:
    if cookie_token:
        return cookie_token
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip() or None
    return None


async def _decode(token: str) -> dict:
    try:
        payload = decode_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc
    if payload.get("scope") == "refresh":
        # Refresh tokens are not valid for resource access.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token scope"
        )
    return payload


async def get_current_citizen(
    db: Annotated[AsyncSession, Depends(get_db)],
    access_token: Annotated[str | None, Cookie()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> Citizen:
    token = _extract_token(access_token, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )
    payload = await _decode(token)
    if payload.get("type") != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Citizen account required"
        )
    citizen = await db.get(Citizen, int(payload["sub"]))
    if citizen is None or not citizen.isActive:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found"
        )
    return citizen


async def get_current_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    access_token: Annotated[str | None, Cookie()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> Admin:
    token = _extract_token(access_token, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )
    payload = await _decode(token)
    if payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin account required"
        )
    admin = await db.get(Admin, int(payload["sub"]))
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found"
        )
    return admin


async def get_optional_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    access_token: Annotated[str | None, Cookie()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> Citizen | Admin | None:
    token = _extract_token(access_token, authorization)
    if not token:
        return None
    try:
        payload = await _decode(token)
    except HTTPException:
        return None
    user_type = payload.get("type")
    user_id = int(payload["sub"])
    if user_type == "citizen":
        return await db.get(Citizen, user_id)
    if user_type == "admin":
        return await db.get(Admin, user_id)
    return None
