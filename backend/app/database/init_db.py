import os
from app.database.db import engine, Base

from app.models.job_offer_db import JobOfferDB, LocationDB


def init_db():
    """Create all tables in the database."""
    os.makedirs("/app/data", exist_ok=True)
    Base.metadata.create_all(engine)
    print("Database initialized successfully!")


if __name__ == "__main__":
    init_db()