from datetime import datetime
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base

class LocationDB(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    offer_guid: Mapped[str] = mapped_column(ForeignKey('offers.guid'))

    city: Mapped[str]
    street: Mapped[str | None]
    latitude: Mapped[float | None]
    longitude: Mapped[float | None]

    offer: Mapped["JobOfferDB"] = relationship(back_populates="location")

class JobOfferDB(Base):
    __tablename__ = "offers"

    guid: Mapped[str] = mapped_column(primary_key=True)
    slug: Mapped[str]

    title : Mapped[str]
    company_name: Mapped[str]
    company_logo_url: Mapped[str | None]

    experience_level: Mapped[str]
    workplace_type: Mapped[str]
    working_time: Mapped[str]

    salary_from: Mapped[int | None]
    salary_to: Mapped[int | None]
    salary_currency: Mapped[str | None]

    required_skills: Mapped[str] = mapped_column(default="")
    nice_to_have_skills: Mapped[str] = mapped_column(default="")

    published_at: Mapped[datetime]
    expires_at: Mapped[datetime | None]

    url: Mapped[str]
    apply_url: Mapped[str | None]

    locations: Mapped[list["LocationDB"]] = relationship(
        back_populates="offer",
        cascade="all, delete-orphan"
    )