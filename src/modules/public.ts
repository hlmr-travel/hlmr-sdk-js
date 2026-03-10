import type { HttpClient } from '../utils/http';
import type {
  PublicOffersList,
  PublicOffersListParams,
  PublicOfferDetail,
  SearchOffersParams,
  SearchOffersResult,
} from '../types/offers';
import type {
  PublicDestinationsList,
  PublicDestinationsListParams,
  PublicCitiesList,
  PublicCitiesListParams,
  PublicDocumentsList,
  PublicDocumentsListParams,
  PublicDocument,
} from '../types/public';

export class PublicModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listOffers(params?: PublicOffersListParams): Promise<PublicOffersList> {
    const query = buildQueryString(params);
    const path = query ? `offers/public/offers?${query}` : 'offers/public/offers';
    const response = await this.http.get<PublicOffersList>(path, { skipAuth: true });
    return response.data;
  }

  async searchOffers(params?: SearchOffersParams): Promise<SearchOffersResult> {
    const query = buildQueryString(params);
    const path = query ? `offers/public/offers/search?${query}` : 'offers/public/offers/search';
    const response = await this.http.get<SearchOffersResult>(path, { skipAuth: true });
    return response.data;
  }

  async getOffer(offerId: string): Promise<PublicOfferDetail> {
    const response = await this.http.get<PublicOfferDetail>(
      `offers/public/offers/${offerId}`,
      { skipAuth: true },
    );
    return response.data;
  }

  async listDestinations(params?: PublicDestinationsListParams): Promise<PublicDestinationsList> {
    const query = buildQueryString(params);
    const path = query ? `geo/public/destinations?${query}` : 'geo/public/destinations';
    const response = await this.http.get<PublicDestinationsList>(path, { skipAuth: true });
    return response.data;
  }

  async listCities(params?: PublicCitiesListParams): Promise<PublicCitiesList> {
    const query = buildQueryString(params);
    const path = query ? `geo/public/cities?${query}` : 'geo/public/cities';
    const response = await this.http.get<PublicCitiesList>(path, { skipAuth: true });
    return response.data;
  }

  async listDocuments(params?: PublicDocumentsListParams): Promise<PublicDocumentsList> {
    const query = buildQueryString(params);
    const path = query ? `terms/public/documents?${query}` : 'terms/public/documents';
    const response = await this.http.get<PublicDocumentsList>(path, { skipAuth: true });
    return response.data;
  }

  async getDocument(documentId: string): Promise<PublicDocument> {
    const response = await this.http.get<PublicDocument>(
      `terms/public/documents/${documentId}`,
      { skipAuth: true },
    );
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
