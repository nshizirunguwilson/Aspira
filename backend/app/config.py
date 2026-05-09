"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    DATABASE_URL: str

    JWT_SECRET_KEY: str = Field(min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    BREVO_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@wilsonn.tech"
    FROM_NAME: str = "Aspira"

    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: Literal["development", "production"] = "development"
    DEBUG: bool = False

    @property
    def cors_origins(self) -> list[str]:
        origins = {self.FRONTEND_URL, "http://localhost:3000"}
        if self.ENVIRONMENT == "production":
            origins.add("https://aspira.vercel.app")
        return sorted(origins)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
