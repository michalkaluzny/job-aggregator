from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.models.job_offer_response import JobOfferResponse
from app.database.repository import get_offer_by_guid, get_offers, delete_expired_offers, get_distinct_cities, get_distinct_skills
from app.database.init_db import init_db
from app.models.paginated_response import PaginatedOfferResponse
from app.scrapers.justjoinit import JustJoinItScraper
from app.scrapers.nofluffjobs import NoFluffJobsScraper
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import math
from datetime import datetime
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    justjoinit = JustJoinItScraper()
    nofluffjobs = NoFluffJobsScraper()
    init_db()
    logger.info("Database initialized")
    scheduler.add_job(justjoinit.run_scrape, "interval", hours=12, args=[1000], next_run_time=datetime.now())
    scheduler.add_job(nofluffjobs.run_scrape, "interval", hours=12, args=[1000], next_run_time=datetime.now())
    scheduler.add_job(delete_expired_offers, "interval", hours=12, next_run_time=datetime.now())
    scheduler.start()
    logger.info("Scheduler started — scraping and cleanup every 12 hours")
    yield
    scheduler.shutdown()
    logger.info("Scheduler stopped")

app = FastAPI(
    title="Job Aggregator API",
    description="Aggregates software engineering job offers",
    version="0.1.0",
    lifespan=lifespan,
)

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Job Aggregator API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/offers", response_model=PaginatedOfferResponse)
def list_offers(
    experience_level: str | None = None,
    workplace_type: str | None = None,
    working_time: str | None = None,
    city: str | None = None,
    skill: str | None = None,
    title: str | None = None,
    sort_by: str = "published_at",
    order: str = "desc",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    """List all offers with filters, sorting and pagination"""
    offset = (page - 1) * size


    offers, total = get_offers(
        experience_level=experience_level,
        workplace_type=workplace_type,
        working_time=working_time,
        city=city,
        skill=skill,
        title=title,
        sort_by=sort_by,
        order=order,
        offset=offset,
        limit=size,
    )

    pages = math.ceil(total/size) if total > 0 else 0

    return PaginatedOfferResponse(
        items=offers,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )




@app.get("/offers/{guid}", response_model=JobOfferResponse)
def get_offer(guid: str):
    """Get a single offer by its GUID."""
    offer = get_offer_by_guid(guid)
    if offer is None:
        raise HTTPException(status_code=404, detail=f"Offer with guid '{guid}' not found")
    return offer

@app.get("/cities", response_model=list[str])
def list_cities():
    """Returns all distinct city names from the database."""
    return get_distinct_cities()

@app.get("/skills", response_model=list[str])
def list_skills():
    """Returns all distinct skills from the database."""
    return get_distinct_skills()

@app.post('/scrape')
def scrape_offers():
    scraper = JustJoinItScraper()
    result = scraper.run_scrape(1000)
    return {"message": result}




