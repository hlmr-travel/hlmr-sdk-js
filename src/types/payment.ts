// Types for payment module (payment links)

export type PaymentScope = 'all' | 'pass' | 'trip' | 'deposit';

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

// Public info for a payment link (GET /v1/payment/links/{token})
export interface PaymentLinkInfo {
  token: string;
  booking_id: string;
  scope: PaymentScope;
  amount: number;
  currency: string;
  status: PaymentLinkStatus;
  expires_at: string;
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
  booking_id: string;
  user_id: string;
  scope: PaymentScope;
  amount: number;
  currency: string;
  status: PaymentLinkStatus;
  payer_type?: PayerType;
  payer_email?: string;
  payer_name?: string;
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
