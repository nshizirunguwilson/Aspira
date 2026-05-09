"""Pydantic schemas for the public services catalog."""

from pydantic import BaseModel, ConfigDict, Field


class ServiceItem(BaseModel):
    """API surface for a service catalog row.

    `validation_alias` (not `alias`) lets us read camelCase columns off the
    ORM via from_attributes while still serialising the snake_case field
    names that the frontend expects.
    """

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    service_id: int = Field(validation_alias="serviceId")
    service_name: str = Field(validation_alias="serviceName")
    icon_name: str = Field(validation_alias="iconName")
    description: str | None = None
