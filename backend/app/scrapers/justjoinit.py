import httpx
from app.models.job_offer import JobOffer
class JustJoinItScraper:
    BASE_URL = 'https://justjoin.it/api/candidate-api/offers'
    def __init__(self, max_offers : int = 1000, page_size : int = 100):
        self.max_offers = max_offers
        self.page_size = page_size
    def fetch_offers(self) -> list[JobOffer]:
        all_offers = []
        from_index = 0

        while len(all_offers) < self.max_offers:
            response = httpx.get(self.BASE_URL, params={'itemsCount': self.page_size, 'from': from_index})
            if response.status_code != 200:
                print(response.status_code)
                return []
            try:
                data = response.json()
                offers = data['data']

                if not offers:
                    print('No offers found')
                    break

                for raw in offers:
                    try:
                        all_offers.append(JobOffer.from_api(raw))
                    except Exception as e:
                        print(f"Failed to parse offer {raw.get('guid', 'unknown')} : {e}")
                from_index += self.page_size
            except Exception as e:
                print(e)
                break

        return all_offers[:self.max_offers]

def main():
    scraper = JustJoinItScraper(max_offers = 100)
    offers = scraper.fetch_offers()

    if not offers:
        print("No offers to display")
        return

    first = offers[0]
    print(f"fetched {len(offers)} offers")
    print(f"First offer: ")
    print(f"Title: {first.title}")
    print(f"Company: {first.company_name}")
    print(f"City: {first.locations[0].city}")
    print(f"experience level: {first.experience_level}")

    for i, offer in enumerate(offers, 1):

        if offer.salary_from:
            print(f'Salary for offer {i}: {offer.salary_from} - {offer.salary_to} : {offer.salary_currency}')
        else:
            print(f'No info about salary for offer {i}')

if __name__ == '__main__':
    main()