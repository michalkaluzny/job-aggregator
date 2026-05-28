import { PaginatedResponse } from '../types/offer';
import { API_BASE_URL } from '../constants';

type QueryParams = Record<string, string | number | undefined>;

export async function fetchOffers(params: QueryParams): Promise<PaginatedResponse> {
  const url = new URL(`${API_BASE_URL}/offers`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<PaginatedResponse>;
}
