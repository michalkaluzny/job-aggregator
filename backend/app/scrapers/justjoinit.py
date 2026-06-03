import httpx
import logging
from app.models.job_offer import JobOffer
from app.database.repository import save_offers

logger = logging.getLogger(__name__)
class JustJoinItScraper:

    BASE_URL = 'https://justjoin.it/api/candidate-api/offers'

    def __init__(self, page_size : int = 100):
        self.page_size = page_size

    def fetch_page(self, from_index: int) -> list[JobOffer]:
        """Fetch and parse one page of offers. """
        response = httpx.get(
            self.BASE_URL,
            params={"itemsCount": self.page_size, "from": from_index}
        )

        if response.status_code != 200:
            logger.error(f"JustJoinIt API error: {response.status_code}")
            return []

        data = response.json()
        raw_offers = data["data"]

        if not raw_offers:
            return []

        parsed = []
        for raw in raw_offers:
            try:
                parsed.append(JobOffer.from_api(raw))
            except Exception as e:
                logger.warning(f"Failed to parse offer {raw.get('guid', 'unknown')}: {e}")

        return parsed

    def fetch_offers(self, max_offers : int = 1000) -> list[JobOffer]:
        """Fetch many pages of offers. (pagination)."""
        all_offers = []
        from_index = 0

        while len(all_offers) < max_offers:
            page = self.fetch_page(from_index)

            if not page:
                break

            all_offers.extend(page)
            from_index += self.page_size

        return all_offers[:max_offers]


    def run_scrape(self, max_offers: int = 1000):
        logger.info(f"Scraping started (max {max_offers} offers)")
        offers = self.fetch_offers(max_offers)
        new_count = save_offers(offers)
        duplicates = len(offers) - new_count
        result = f"Scraped {len(offers)} offers — {new_count} new, {duplicates} duplicates"
        logger.info(result)
        return result
