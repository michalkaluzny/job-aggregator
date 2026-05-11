from app.database.db import SessionLocal
from app.models.job_offer import JobOffer
from app.models.job_offer_db import JobOfferDB, LocationDB
from sqlalchemy import select
from sqlalchemy.orm import selectinload

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

def get_offers(
    experience_level: str | None = None,
    workplace_type: str | None = None,
    working_time: str | None = None,
    city: str | None = None,
    skill: str | None = None,
    limit: int = 100,
) -> list[JobOffer]:
    """Get offers from database with optional filters."""
    with SessionLocal() as session:
        stmt = select(JobOfferDB)

        if experience_level:
            stmt = stmt.where(JobOfferDB.experience_level == experience_level)

        if workplace_type:
            stmt = stmt.where(JobOfferDB.workplace_type == workplace_type)

        if working_time:
            stmt = stmt.where(JobOfferDB.working_time == working_time)

        if skill:
            stmt = stmt.where(JobOfferDB.required_skills.contains(skill))

        if city:
            stmt = (
                stmt
                .join(LocationDB, LocationDB.offer_guid == JobOfferDB.guid)
                .where(LocationDB.city == city)
                .distinct()
            )

        stmt = stmt.limit(limit)

        return list(session.execute(stmt).scalars().all())

def get_offer_by_guid(guid: str) -> JobOfferDB | None:
    """Get a single offer by its GUID, or None if not found."""
    with SessionLocal() as session:
        stmt = (
            select(JobOfferDB)
            .where(JobOfferDB.guid == guid)
            .options(selectinload(JobOfferDB.locations))
        )
        return session.execute(stmt).scalars().one_or_none()


