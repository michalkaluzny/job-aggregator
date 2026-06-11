import logging

from app.database.db import engine, Base
from app.models.job_offer_db import JobOfferDB, LocationDB

logger = logging.getLogger(__name__)


def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(engine)
    logger.info("Database initialized successfully!")

