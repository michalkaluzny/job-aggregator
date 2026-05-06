from pydantic import BaseModel
from datetime import datetime

class Location(BaseModel):
    city: str
    street: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class JobOffer(BaseModel):
    # Id
    guid: str
    slug: str

    # Basic Info
    title: str
    company_name: str
    company_logo_url: str | None = None

    # Classification
    experience_level: str
    workplace_type: str
    working_time: str

    # Locations
    locations: list[Location]

    # Salary
    salary_from: int | None = None
    salary_to: int | None = None
    salary_currency: str | None = None

    # Skills
    required_skills: list[str] = []
    nice_to_have_skills: list[str] = []

    # Dates
    published_at: datetime
    expires_at: datetime | None = None

    # URLs
    url: str  # our url
    apply_url: str | None = None  # from api

    @classmethod
    def from_api(cls, raw: dict) -> "JobOffer":
        salary_from = None
        salary_to = None
        salary_currency = None

        for emp_type in raw['employmentTypes']:
            if emp_type.get('currency') == 'PLN' and emp_type.get('from') is not None:
                salary_from = emp_type['from']
                salary_to = emp_type['to']
                salary_currency = 'PLN'
                break

        required_skills = [s["name"] for s in raw.get("requiredSkills", [])]
        nice_to_have_skills = [s["name"] for s in raw.get("niceToHaveSkills", [])]

        return cls(
            guid=raw["guid"],
            slug=raw["slug"],
            title=raw["title"],
            company_name=raw["companyName"],
            company_logo_url=raw.get("companyLogoThumbUrl"),
            experience_level=raw["experienceLevel"],
            workplace_type=raw["workplaceType"],
            working_time=raw["workingTime"],
            locations=raw["locations"],
            salary_from=salary_from,
            salary_to=salary_to,
            salary_currency=salary_currency,
            required_skills=required_skills,
            nice_to_have_skills=nice_to_have_skills,
            published_at=raw["publishedAt"],
            expires_at=raw.get("expiredAt"),
            url=f"https://justjoin.it/job-offer/{raw['slug']}",
            apply_url=raw.get("applyUrl"),
        )
