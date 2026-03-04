import type { HttpClient } from '../utils/http';
import type { OffersList, OffersListParams } from '../types/offers';

export class OffersModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(params?: OffersListParams): Promise<OffersList> {
    const query = buildQueryString(params);
    const path = query ? `offers/offers?${query}` : 'offers/offers';
    const response = await this.http.get<OffersList>(path);
    return response.data;
  }
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
