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
  name: string;
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
  departure_city: string;
  distance_km: number;
  supplement: number;
  created_at: string;
  updated_at: string;
}

export interface OfferDurationDiscount {
  id: string;
  offer_id: string;
  min_days: number;
  max_days: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface OfferTerm {
  id: string;
  offer_id: string;
  term_type: TermTypeEnum;
  document_id: string;
  required: boolean;
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
  price_per_day: number;
  min_days: number;
  max_days: number;
  status: OfferStatus;
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
  capacity: number;
  reserved_count: number;
  eligibility: OfferEligibility;
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

export interface OffersListParams {
  page?: number;
  page_size?: number;
  country?: string;
  offer_type?: OfferType | 'all';
}
