"""Pydantic schemas for the public services catalog."""

from pydantic import BaseModel, ConfigDict, Field


class ServiceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    service_id: int = Field(alias="serviceId")
    service_name: str = Field(alias="serviceName")
    icon_name: str = Field(alias="iconName")
    description: str | None = None
