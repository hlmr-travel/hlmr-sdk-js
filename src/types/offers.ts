// Types for offers module

// Enums

export type OfferStatus = 'draft' | 'published' | 'closed' | 'archived';

export type OfferType = 'trip' | 'pass';

export type PricingType = 'dynamic' | 'fixed';

export type AccommodationTierEnum = 'hostel' | 'hotel_3' | 'hotel_4' | 'hotel_5' | 'apartment';

export type TermTypeEnum = 'terms_of_service' | 'privacy_policy' | 'cancellation_policy' | 'travel_insurance';

// Child entities

export interface OfferSeason {
  id: string;
  offer_id: string;
  label: string;
  start_date: string;
  end_date: string;
  coefficient: number;
  created_at: string;
  updated_at: string;
}

export interface OfferAccommodationTier {
  id: string;
  offer_id: string;
  tier: AccommodationTierEnum;
  supplement_per_night: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface OfferFlightTier {
  id: string;
  offer_id: string;
  min_distance_km: number;
  max_distance_km: number;
  supplement: number;
  created_at: string;
  updated_at: string;
}

export interface OfferDurationDiscount {
  id: string;
  offer_id: string;
  from_day: number;
  to_day: number;
  discount_rate: number;
  created_at: string;
  updated_at: string;
}

export interface OfferTerm {
  id: string;
  offer_id: string;
  term_type: string;
  term_document_id: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

// Eligibility

export interface OfferEligibility {
  eligible: boolean;
  reasons?: string[];
}

// Public offer (no capacity, no eligibility)

export interface PublicOffer {
  id: string;
  title: string;
  offer_type: OfferType;
  pricing_type: PricingType;
  destination_country: string;
  destination_lat: number;
  destination_lng: number;
  price_per_day: number;
  min_days: number;
  max_days: number;
  open_date: string | null;
  close_date: string | null;
  status: OfferStatus;
  media_urls?: string[];
  // Pass-specific (when offer_type === 'pass')
  catalog_price?: number;
}

export interface PublicOfferDetail extends PublicOffer {
  description?: string;
  seasons: OfferSeason[];
  accommodation_tiers: OfferAccommodationTier[];
  flight_tiers: OfferFlightTier[];
  duration_discounts: OfferDurationDiscount[];
  terms: OfferTerm[];
  created_at: string;
  updated_at: string;
}

// Authenticated offer (includes capacity + eligibility)

export interface Offer extends PublicOffer {
  capacity: number | null;
  eligibility: OfferEligibility;
}

// Availability per day

export interface OfferAvailabilityDay {
  date: string;
  occupied: number;
  capacity: number | null;
  available: number | null;
}

export interface OfferAvailabilityParams {
  start_date: string;
  end_date: string;
}

// Paginated responses

export interface PublicOffersList {
  offers: PublicOffer[];
  total: number;
  page: number;
  page_size: number;
}

export interface OffersList {
  offers: Offer[];
  total: number;
  page: number;
  page_size: number;
}

// Query params

export interface PublicOffersListParams {
  page?: number;
  page_size?: number;
  country?: string;
  offer_type?: OfferType | 'all';
}

export type OfferSortBy = 'created_at' | 'price_per_day' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SearchOffersParams {
  q?: string;
  offer_type?: OfferType | 'all';
  country?: string;
  min_days?: number;
  max_days?: number;
  max_price_per_day?: number;
  sort_by?: OfferSortBy;
  sort_order?: SortOrder;
  page?: number;
  page_size?: number;
}

export interface SearchOffersResult {
  offers: PublicOffer[];
  total: number;
  page: number;
  page_size: number;
  query?: string;
}

export interface OffersListParams {
  page?: number;
  page_size?: number;
  country?: string;
  offer_type?: OfferType | 'all';
}
