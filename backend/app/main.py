from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.models.job_offer_response import JobOfferResponse
from app.database.repository import get_offer_by_guid, get_offers
from app.models.paginated_response import PaginatedOfferResponse
from app.scrapers.justjoinit import JustJoinItScraper
from apscheduler.schedulers.background import BackgroundScheduler
import math

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scraper = JustJoinItScraper()
    scheduler.add_job(scraper.run_scrape, "interval", hours=6)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(
    title="Job Aggregator API",
    description="Aggregates software engineering job offers",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

@app.post('/scrape')
def scrape_offers():
    scraper = JustJoinItScraper()
    result = scraper.run_scrape(100)
    return {"message": result}




