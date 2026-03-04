// Types for public routes (geo, terms)

// Geo types

export interface PublicDestination {
  id: string;
  country: string;
  name: string;
  description?: string;
}

export interface PublicCity {
  id: string;
  destination_id: string;
  name: string;
  country: string;
  distance_km?: number;
}

// Terms types

export interface PublicDocumentSummary {
  id: string;
  type: string;
  title: string;
  version: string;
  published_at: string;
}

export interface PublicDocument extends PublicDocumentSummary {
  content: string;
}

// Paginated responses

export interface PublicDestinationsList {
  destinations: PublicDestination[];
  total: number;
  page: number;
  page_size: number;
}

export interface PublicCitiesList {
  cities: PublicCity[];
  total: number;
  page: number;
  page_size: number;
}

export interface PublicDocumentsList {
  documents: PublicDocumentSummary[];
  total: number;
  page: number;
  page_size: number;
}

// Query params

export interface PublicDestinationsListParams {
  page?: number;
  page_size?: number;
  country?: string;
}

export interface PublicCitiesListParams {
  page?: number;
  page_size?: number;
  destination_id?: string;
}

export interface PublicDocumentsListParams {
  page?: number;
  page_size?: number;
  type?: string;
}
