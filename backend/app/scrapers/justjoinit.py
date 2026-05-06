import httpx
from app.models.job_offer import JobOffer

BASE_URL = 'https://justjoin.it/api/candidate-api/offers'
def fetch_offers(items_count : int = 10) -> list[JobOffer]:
    response = httpx.get(BASE_URL, params={'itemsCount': items_count})
    if response.status_code == 200:
        try:
            data = response.json()
            offers = data['data']

            if not offers:
                print('No offers found')
                return []
            print(offers)
            return [JobOffer.from_api(raw) for raw in offers]


        except Exception as e:
            print(e)
            return []
    else:
        print(response.status_code)
        return []

def main():
    offers = fetch_offers()

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