from app.database.db import engine, Base
from app.models.job_offer_db import JobOfferDB, LocationDB


def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(engine)
    print("Database initialized successfully!")

