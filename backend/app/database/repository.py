from app.database.db import SessionLocal
from app.models.job_offer import JobOffer
from app.models.job_offer_db import JobOfferDB, LocationDB
from sqlalchemy import select, func, desc, asc
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
    sort_by: str = "published_at",
    order: str = "desc",
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[JobOffer], int]:
    """
    Get offers from database with filters, sorting and pagination.
    Returns (offers, total count).
    """
    with SessionLocal() as session:
        stmt = select(JobOfferDB).options(selectinload(JobOfferDB.locations))
        count_stmt = select(func.count(JobOfferDB.guid))

        filters = []
        if experience_level:
            filters.append(JobOfferDB.experience_level == experience_level)
        else:
            filters.append(JobOfferDB.experience_level.in_(["junior", "intern"]))
        if workplace_type:
            filters.append(JobOfferDB.workplace_type == workplace_type)

        if working_time:
            filters.append(JobOfferDB.working_time == working_time)

        if skill:
            filters.append(JobOfferDB.required_skills.contains(skill))

        for f in filters:
            stmt = stmt.where(f)
            count_stmt = count_stmt.where(f)

        if city:
            stmt = (
                stmt
                .join(LocationDB, LocationDB.offer_guid == JobOfferDB.guid)
                .where(LocationDB.city == city)
                .distinct()
            )
            count_stmt = (
                count_stmt
                .join(LocationDB, LocationDB.offer_guid == JobOfferDB.guid)
                .where(LocationDB.city == city)
            )

        sort_column = getattr(JobOfferDB, sort_by, JobOfferDB.published_at)
        if order == "desc":
            stmt = stmt.order_by(desc(sort_column))
        else:
            stmt = stmt.order_by(asc(sort_column))

        stmt = stmt.offset(offset).limit(limit)

        offers = list(session.execute(stmt).scalars().all())
        total = session.execute(count_stmt).scalar_one()

        return offers, total

def get_offer_by_guid(guid: str) -> JobOfferDB | None:
    """Get a single offer by its GUID, or None if not found."""
    with SessionLocal() as session:
        stmt = (
            select(JobOfferDB)
            .where(JobOfferDB.guid == guid)
            .options(selectinload(JobOfferDB.locations))
        )
        return session.execute(stmt).scalars().one_or_none()


