from pydantic import BaseModel
from datetime import datetime, timezone

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
    def from_justjoinit(cls, raw: dict) -> "JobOffer":
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

    @classmethod
    def from_nofluffjobs(cls, raw: dict) -> "JobOffer":
        # Salary — NoFluffJobs keeps it in a single dict, not a list.
        # Only treat it as real money when it's disclosed and non-zero.
        salary_from = None
        salary_to = None
        salary_currency = None

        salary = raw.get("salary") or {}
        if salary.get("disclosedAt") == "VISIBLE" and salary.get("from"):
            salary_from = salary.get("from")
            salary_to = salary.get("to")
            salary_currency = salary.get("currency")

        # Workplace — derived from two separate flags.
        location = raw.get("location") or {}
        if raw.get("fullyRemote"):
            workplace_type = "remote"
        elif location.get("hybridDesc"):
            workplace_type = "hybrid"
        else:
            workplace_type = "office"

        # Working time — only the intern signal is reliable here.
        working_time = "internship" if salary.get("type") == "intern" else "full_time"

        # Seniority comes as a list (e.g. ["Trainee"]); lowercase to match JustJoinIt.
        seniority = raw.get("seniority") or []
        experience_level = seniority[0].lower() if seniority else "unknown"

        # Locations — flatten places, pulling lat/long out of the nested geoLocation.
        locations = [
            Location(
                city=place["city"],
                street=place.get("street") or None,
                latitude=place.get("geoLocation", {}).get("latitude"),
                longitude=place.get("geoLocation", {}).get("longitude"),
            )
            for place in location.get("places", [])
            if place.get("city")
        ]

        # Required skills live in tiles, mixed with other tile types.
        tiles = raw.get("tiles", {}).get("values", [])
        required_skills = [t["value"] for t in tiles if t.get("type") == "requirement"]

        # Logo paths are relative — prepend the static asset host.
        logo_path = raw.get("logo", {}).get("jobs_details")
        company_logo_url = f"https://static.nofluffjobs.com/{logo_path}" if logo_path else None

        # `posted` is epoch milliseconds, not an ISO string.
        published_at = datetime.fromtimestamp(raw["posted"] / 1000, tz=timezone.utc)

        return cls(
            guid=raw["reference"],
            slug=raw["url"],
            title=raw["title"],
            company_name=raw["name"],
            company_logo_url=company_logo_url,
            experience_level=experience_level,
            workplace_type=workplace_type,
            working_time=working_time,
            locations=locations,
            salary_from=salary_from,
            salary_to=salary_to,
            salary_currency=salary_currency,
            required_skills=required_skills,
            nice_to_have_skills=[],
            published_at=published_at,
            expires_at=None,
            url=f"https://nofluffjobs.com/job/{raw['url']}",
            apply_url=None,
        )

