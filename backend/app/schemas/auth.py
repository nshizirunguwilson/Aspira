"""Pydantic schemas for authentication requests and responses."""

import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

PHONE_RE = re.compile(r"^\+?[\d]{9,13}$")


class CitizenRegisterRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=255)
    phone_number: str = Field(min_length=9, max_length=20)
    id_number: str = Field(min_length=5, max_length=50)
    email: EmailStr | None = None
    address: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if not PHONE_RE.match(cleaned):
            raise ValueError("Phone must be 9–13 digits, optional leading +")
        return cleaned

    @field_validator("full_name", "id_number", "address")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def passwords_match(self) -> "CitizenRegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class CitizenRegisterResponse(BaseModel):
    citizen_id: int
    message: str = "Registration successful"


class CitizenLoginRequest(BaseModel):
    phone_number: str
    password: str = Field(min_length=1)


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1)


class CitizenSummary(BaseModel):
    id: int
    name: str


class AdminSummary(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Literal["super_admin", "service_admin"]


class TokenResponse(BaseModel):
    """Returned after a successful login or refresh."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"


class CitizenLoginResponse(TokenResponse):
    citizen: CitizenSummary


class AdminLoginResponse(TokenResponse):
    admin: AdminSummary


class CurrentUserResponse(BaseModel):
    type: Literal["citizen", "admin"]
    id: int
    name: str
