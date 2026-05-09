"""Auth business logic — kept out of the router for testability."""

import hashlib
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.admin import Admin
from app.models.citizen import Citizen
from app.models.refresh_token import RefreshToken, TokenUserType
from app.schemas.auth import CitizenRegisterRequest
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


def _hash_refresh(token: str) -> str:
    """Hash a refresh token for storage so a DB leak doesn't yield live tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register_citizen(self, data: CitizenRegisterRequest) -> Citizen:
        citizen = Citizen(
            fullName=data.full_name,
            phoneNumber=data.phone_number,
            idNumber=data.id_number,
            password=hash_password(data.password),
            address=data.address,
        )
        self.db.add(citizen)
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number or ID number is already registered",
            ) from exc
        await self.db.refresh(citizen)
        return citizen

    async def authenticate_citizen(self, phone: str, password: str) -> Citizen:
        result = await self.db.execute(
            select(Citizen).where(Citizen.phoneNumber == phone.strip())
        )
        citizen = result.scalar_one_or_none()
        if citizen is None or not verify_password(password, citizen.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone number or password",
            )
        if not citizen.isActive:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        return citizen

    async def authenticate_admin(self, username: str, password: str) -> Admin:
        result = await self.db.execute(
            select(Admin).where(Admin.username == username.strip())
        )
        admin = result.scalar_one_or_none()
        if admin is None or not verify_password(password, admin.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )
        return admin

    async def issue_tokens(
        self, user_id: int, user_type: TokenUserType
    ) -> tuple[str, str]:
        """Create an access + refresh pair, persisting the refresh hash."""
        access = create_access_token(user_id, user_type.value)
        refresh, expires_at = create_refresh_token(user_id, user_type.value)
        self.db.add(
            RefreshToken(
                userType=user_type,
                userId=user_id,
                tokenHash=_hash_refresh(refresh),
                expiresAt=expires_at,
            )
        )
        await self.db.commit()
        return access, refresh

    async def rotate_refresh(self, refresh_token: str) -> tuple[str, str, dict]:
        """Validate an incoming refresh token, revoke it, and mint a new pair."""
        from app.utils.security import JWTError, decode_token

        try:
            payload = decode_token(refresh_token)
        except JWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            ) from exc
        if payload.get("scope") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is not a refresh token",
            )

        token_hash = _hash_refresh(refresh_token)
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.tokenHash == token_hash)
        )
        record = result.scalar_one_or_none()
        if record is None or record.isRevoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token revoked or unknown",
            )
        if record.expiresAt.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired",
            )

        record.isRevoked = True
        await self.db.flush()

        user_id = int(payload["sub"])
        user_type = TokenUserType(payload["type"])
        access, new_refresh = await self.issue_tokens(user_id, user_type)
        return access, new_refresh, payload


async def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthService:
    return AuthService(db)
