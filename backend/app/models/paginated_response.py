from pydantic import BaseModel

from app.models.job_offer_response import JobOfferResponse

class PaginatedOfferResponse(BaseModel):
    """Paginated list of offers response with metadata."""
    items: list[JobOfferResponse]
    total: int
    page: int
    size: int
    pages: int
