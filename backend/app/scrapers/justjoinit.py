import httpx
from app.models.job_offer import JobOffer
from app.database.repository import save_offers
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
            print(f"Error: {response.status_code}")
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
                print(f"Failed to parse offer {raw.get('guid', 'unknown')}: {e}")

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


    def run_scrape(self, max_offers : int = 1000):
        offers = self.fetch_offers(max_offers)

        new_count = save_offers(offers)
        duplicates = len(offers) - new_count
        return f"Found {new_count} new offers to database and skipped {duplicates} duplicates"



def main():
    scraper = JustJoinItScraper()
    offers = scraper.fetch_offers(1000)
    if not offers:
        print("No offers to display")
        return

    print(f"Found {len(offers)} offers from API")

    #Save to databse
    new_count = save_offers(offers)
    duplicates = len(offers) - new_count

    print(f"Saved {new_count} new offers to database")
    print(f"Skipped {duplicates} duplicates")

    first = offers[0]
    print(f"\nFirst offer: {first.title} @ {first.company_name}")
    print(f"  Location: {first.locations[0].city}")
    print(f"  URL: {first.url}")



if __name__ == '__main__':
    main()