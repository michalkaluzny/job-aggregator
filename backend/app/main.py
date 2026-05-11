from fastapi import FastAPI, HTTPException
from app.models.job_offer_response import JobOfferResponse
from app.database.repository import get_offer_by_guid

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

@app.get("/offers/{guid}", response_model=JobOfferResponse)
def get_offer(guid: str):
    """Get a single offer by its GUID."""
    offer = get_offer_by_guid(guid)
    if offer is None:
        raise HTTPException(status_code=404, detail=f"Offer with guid '{guid}' not found")
    return offer


