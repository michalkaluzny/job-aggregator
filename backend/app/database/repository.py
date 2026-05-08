from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.job_offer import JobOffer
from app.models.job_offer_db import JobOfferDB, LocationDB

def save_offers(offers: list[JobOffer]) -> int:
    """
    Saves offers to the database, skipping duplicates by guid.
    Returns the number of newly added offers.
    """
    new_count = 0

    with SessionLocal() as session:
        for offer in offers:
            existing = session.get(JobOfferDB, offer.guid)
            if existing is not None:
                continue

        db_offer = pydantic_to_db(offer)
        session.add(db_offer)
        new_count += 1

        session.commit()
    return new_count

def pydantic_to_db(offer: JobOffer) -> JobOfferDB:
    """Converts pydantic JobOffer to SQLAlchemy JobOfferDB."""
    db_locations = [
        LocationDB(
            city=loc.city,
            street=loc.street,
            latitude=loc.latitude,
            longitude=loc.longitude,
        )
        for loc in offer.locations
    ]

    return JobOfferDB(
        guid=offer.guid,
        slug=offer.slug,
        title=offer.title,
        company_name=offer.company_name,
        company_logo_url=offer.company_logo_url,
        experience_level=offer.experience_level,
        workplace_type=offer.workplace_type,
        working_time=offer.working_time,
        salary_from=offer.salary_from,
        salary_to=offer.salary_to,
        salary_currency=offer.salary_currency,
        required_skills=",".join(offer.required_skills),
        nice_to_have_skills=",".join(offer.nice_to_have_skills),
        published_at=offer.published_at,
        expires_at=offer.expires_at,
        url=offer.url,
        apply_url=offer.apply_url,
        locations=db_locations,
    )

