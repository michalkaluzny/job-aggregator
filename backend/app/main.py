from fastapi import FastAPI, HTTPException
from app.models.job_offer_response import JobOfferResponse
from app.database.repository import get_offer_by_guid, get_offers

app = FastAPI(
    title="Job Aggregator API",
    description="Aggregates software engineering job offers",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Job Aggregator API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/offers", response_model=list[JobOfferResponse])
def list_offers(
    experience_level: str | None = None,
    workplace_type: str | None = None,
    working_time: str | None = None,
    city: str | None = None,
    skill: str | None = None,
    limit: int = 100,
):
    offers = get_offers(
        experience_level=experience_level,
        workplace_type=workplace_type,
        working_time=working_time,
        city=city,
        skill=skill,
        limit=limit
    )

    return offers




@app.get("/offers/{guid}", response_model=JobOfferResponse)
def get_offer(guid: str):
    """Get a single offer by its GUID."""
    offer = get_offer_by_guid(guid)
    if offer is None:
        raise HTTPException(status_code=404, detail=f"Offer with guid '{guid}' not found")
    return offer


