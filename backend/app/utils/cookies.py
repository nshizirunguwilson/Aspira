"""Cookie helpers — single source of truth for token cookie attributes."""

from fastapi import Response

from app.config import get_settings

settings = get_settings()

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


def _is_production() -> bool:
    return settings.ENVIRONMENT == "production"


def set_access_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=_is_production(),
        samesite="lax",
        path="/",
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=_is_production(),
        samesite="lax",
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    for key in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(key=key, path="/")
