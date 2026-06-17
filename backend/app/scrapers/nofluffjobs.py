import httpx
import logging
from app.models.job_offer import JobOffer
from app.database.repository import save_offers

logger = logging.getLogger(__name__)


class NoFluffJobsScraper:

    BASE_URL = "https://nofluffjobs.com/api/search/posting"

    def __init__(self, seniorities: list[str] | None = None, page_size: int = 1000):
        # NoFluffJobs returns the whole matching result set in a single request
        # when page_size is large enough, so we don't paginate — we ask for one
        # big page. The seniority filter keeps the dataset focused on juniors.
        self.seniorities = seniorities or ["trainee", "junior"]
        self.page_size = page_size

    def fetch_offers(self, max_offers: int = 1000) -> list[JobOffer]:
        """Fetch all matching offers in one request and parse them."""
        response = httpx.post(
            self.BASE_URL,
            params={
                "pageTo": 1,
                "pageSize": self.page_size,
                "region": "pl",
                "salaryCurrency": "PLN",
                "salaryPeriod": "month",
            },
            headers={"content-type": "application/infiniteSearch+json"},
            json={"criteriaSearch": {"seniority": self.seniorities}},
        )

        if response.status_code != 200:
            logger.error(f"NoFluffJobs API error: {response.status_code}")
            return []

        data = response.json()
        raw_offers = data.get("postings", [])
        total = data.get("totalCount", len(raw_offers))

        # Defensive: if the API capped us below the real total, surface it.
        if len(raw_offers) < total:
            logger.warning(
                f"NoFluffJobs returned {len(raw_offers)} of {total} offers — "
                f"raise page_size (currently {self.page_size})"
            )

        parsed = []
        for raw in raw_offers:
            try:
                parsed.append(JobOffer.from_nofluffjobs(raw))
            except Exception as e:
                logger.warning(f"Failed to parse offer {raw.get('id', 'unknown')}: {e}")

        return parsed[:max_offers]

    def run_scrape(self, max_offers: int = 1000):
        logger.info(f"NoFluffJobs scraping started (max {max_offers} offers)")
        offers = self.fetch_offers(max_offers)
        new_count = save_offers(offers)
        duplicates = len(offers) - new_count
        result = f"Scraped {len(offers)} NoFluffJobs offers — {new_count} new, {duplicates} duplicates"
        logger.info(result)
        return result
