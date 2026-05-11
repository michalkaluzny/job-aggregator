from datetime import datetime
from pydantic import BaseModel


class LocationResponse(BaseModel):
    city: str
    street: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    model_config = {"from_attributes": True}


class JobOfferResponse(BaseModel):
    guid: str
    slug: str
    title: str
    company_name: str
    company_logo_url: str | None = None

    experience_level: str
    workplace_type: str
    working_time: str

    locations: list[LocationResponse]

    salary_from: int | None = None
    salary_to: int | None = None
    salary_currency: str | None = None

    required_skills: str
    nice_to_have_skills: str

    published_at: datetime
    expires_at: datetime | None = None

    url: str
    apply_url: str | None = None

    model_config = {"from_attributes": True}