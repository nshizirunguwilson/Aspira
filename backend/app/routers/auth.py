"""Authentication routes — citizen + admin login, register, refresh, me."""

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_optional_user
from app.models.admin import Admin
from app.models.citizen import Citizen
from app.models.refresh_token import TokenUserType
from app.schemas.auth import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminSummary,
    CitizenLoginRequest,
    CitizenLoginResponse,
    CitizenRegisterRequest,
    CitizenRegisterResponse,
    CitizenSummary,
    CurrentUserResponse,
    TokenResponse,
)
from app.services.auth_service import AuthService, get_auth_service
from app.utils.cookies import (
    REFRESH_COOKIE,
    clear_auth_cookies,
    set_access_cookie,
    set_refresh_cookie,
)

router = APIRouter()


@router.post(
    "/citizen/register",
    response_model=CitizenRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_citizen(
    payload: CitizenRegisterRequest,
    auth: Annotated[AuthService, Depends(get_auth_service)],
) -> CitizenRegisterResponse:
    citizen = await auth.register_citizen(payload)
    return CitizenRegisterResponse(citizen_id=citizen.citizenId)


@router.post("/citizen/login", response_model=CitizenLoginResponse)
async def login_citizen(
    payload: CitizenLoginRequest,
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)],
) -> CitizenLoginResponse:
    citizen = await auth.authenticate_citizen(payload.phone_number, payload.password)
    access, refresh = await auth.issue_tokens(citizen.citizenId, TokenUserType.citizen)
    set_access_cookie(response, access)
    set_refresh_cookie(response, refresh)
    return CitizenLoginResponse(
        access_token=access,
        citizen=CitizenSummary(id=citizen.citizenId, name=citizen.fullName),
    )


@router.post("/admin/login", response_model=AdminLoginResponse)
async def login_admin(
    payload: AdminLoginRequest,
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)],
) -> AdminLoginResponse:
    admin = await auth.authenticate_admin(payload.username, payload.password)
    access, refresh = await auth.issue_tokens(admin.adminId, TokenUserType.admin)
    set_access_cookie(response, access)
    set_refresh_cookie(response, refresh)
    return AdminLoginResponse(
        access_token=access,
        admin=AdminSummary(
            id=admin.adminId,
            username=admin.username,
            email=admin.email,
            role=admin.role.value,
        ),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    clear_auth_cookies(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    response: Response,
    auth: Annotated[AuthService, Depends(get_auth_service)],
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE)] = None,
) -> TokenResponse:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token cookie missing",
        )
    access, new_refresh, _payload = await auth.rotate_refresh(refresh_token)
    set_access_cookie(response, access)
    set_refresh_cookie(response, new_refresh)
    return TokenResponse(access_token=access)


@router.get("/me", response_model=CurrentUserResponse)
async def me(
    user: Annotated[Citizen | Admin | None, Depends(get_optional_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CurrentUserResponse:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if isinstance(user, Citizen):
        return CurrentUserResponse(type="citizen", id=user.citizenId, name=user.fullName)
    return CurrentUserResponse(type="admin", id=user.adminId, name=user.username)
