// Types for payment module (payment links)

export type PaymentScope = 'all' | 'pass' | 'trip' | 'deposit' | 'free';

export type PaymentLinkStatus = 'pending' | 'completed' | 'expired' | 'cancelled';

export type PayerType = 'self' | 'gift';

// Result returned when creating a payment link via booking.pay()
export interface PaymentLinkResult {
  payment_link_url: string;
  token: string;
  amount: number;
  scope: PaymentScope;
  expires_at: string;
}

// Result returned when creating a free payment link
export interface FreePaymentLinkResult {
  id: string;
  token: string;
  payment_link_url: string;
  amount: number | null;
  currency: string;
  scope: 'free';
  status: PaymentLinkStatus;
  expires_at: string;
  version: number;
}

// Params for creating a free payment link
export interface CreatePaymentLinkParams {
  amount?: number;
  currency?: string;
  message?: string;
  description?: string;
  expires_in_hours?: number;
  redirect_url?: string;
  metadata?: Record<string, unknown>;
}

// Params for listing payment links
export interface ListPaymentLinksParams {
  status?: PaymentLinkStatus;
  limit?: number;
  offset?: number;
}

// Paginated list of payment links
export interface PaymentLinksList {
  items: PaymentLinkListItem[];
  total: number;
  limit: number;
  offset: number;
}

// Item in a payment link list
export interface PaymentLinkListItem {
  id: string;
  token: string;
  payment_link_url: string;
  booking_id: string | null;
  scope: PaymentScope;
  amount: number | null;
  currency: string;
  status: PaymentLinkStatus;
  message: string | null;
  description: string | null;
  expires_at: string;
  created_at: string;
}

// Public info for a payment link (GET /v1/payment/links/{token})
export interface PaymentLinkInfo {
  token: string;
  booking_id: string | null;
  scope: PaymentScope;
  amount: number | null;
  currency: string;
  status: PaymentLinkStatus;
  expires_at: string;
  message?: string;
  description?: string;
  created_by_type?: string;
  booking_summary?: PaymentLinkBookingSummary;
}

// Booking summary embedded in PaymentLinkInfo
export interface PaymentLinkBookingSummary {
  offer_id: string;
  start_date: string;
  duration_days: number;
  accommodation_tier: string;
  departure_city: string;
  travelers: number;
}

// Status-only response (GET /v1/payment/links/{token}/status)
export interface PaymentLinkStatusInfo {
  status: PaymentLinkStatus;
  completed_at?: string;
}

// Full payment link response (admin/internal)
export interface PaymentLink {
  id: string;
  token: string;
  payment_link_url: string;
  booking_id: string | null;
  user_id: string;
  scope: PaymentScope;
  amount: number | null;
  currency: string;
  status: PaymentLinkStatus;
  payer_type?: PayerType;
  payer_email?: string;
  payer_name?: string;
  message?: string;
  description?: string;
  created_by_type?: string;
  created_by_id?: string;
  version: number;
  previous_link_id?: string;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Request params for booking.pay()
export interface PayBookingParams {
  scope?: PaymentScope;
  redirect_url?: string;
}

// Request params for booking.renewPaymentLink()
export interface RenewPaymentLinkResult {
  id: string;
  token: string;
  payment_link_url: string;
  amount: number;
  scope: PaymentScope;
  status: PaymentLinkStatus;
  version: number;
  expires_at: string;
}
