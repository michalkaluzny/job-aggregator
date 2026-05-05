import httpx

BASE_URL = 'https://justjoin.it/api/candidate-api/offers'
def fetch_offers(items_count : int = 10) -> list[dict]:
    response = httpx.get(BASE_URL, params={'itemsCount': items_count})
    if response.status_code == 200:
        try:
            data = response.json()
            offers = data['data']

            if not offers:
                print('No offers found')
                return []

            return offers

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
    print(f"Title: {first['title']}")
    print(f"Company: {first['companyName']}")
    print(f"City: {first['city']}")

if __name__ == '__main__':
    main()