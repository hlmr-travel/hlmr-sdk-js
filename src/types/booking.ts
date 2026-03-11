// Types for booking module

// Enums

export type BookingState = 'intent' | 'quoted' | 'pending' | 'confirming' | 'confirmed' | 'cancelled';

export type BookingType = 'trip' | 'trip_extension' | 'pass';

export type PaymentMode = 'oneshot' | 'monthly';

export type RequirementType = 'terms_acceptance' | 'user_data_complete' | 'mira_pass' | 'passport_kyc' | 'deposit_funded' | 'payment_collected' | 'important_notice';

export type NoticeSeverity = 'info' | 'warning' | 'critical';

export type NoticeTheme = 'health' | 'visa' | 'logistics' | 'safety' | 'booking_change' | 'general';

export type RequirementStatus = 'pending' | 'completed' | 'waived';

export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'failed';

// Sub-entities

export interface PricingSnapshot {
  total: number;
  deposit_target: number;
  breakdown: { [key: string]: any };
  payment_options: { mode: string; total: number; discount_applied?: number; installments?: any[] }[];
  integrity_hash: string;
  expires_at: string;
}

export interface NoticeMetadata {
  title: { [locale: string]: string };
  body: { [locale: string]: string };
  severity: NoticeSeverity;
  theme: NoticeTheme;
  created_by: string;
}

export interface BookingRequirement {
  id: string;
  booking_id: string;
  type: RequirementType;
  status: RequirementStatus;
  completed_at?: string;
  metadata?: NoticeMetadata | { [key: string]: any };
}

export interface BookingInstallment {
  id: string;
  booking_id: string;
  due_date: string;
  amount: number;
  label: string;
  status: InstallmentStatus;
  paid_at?: string;
  payment_source?: string;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  event_type: string;
  actor_type: 'user' | 'admin' | 'system';
  actor_id: string;
  metadata?: { [key: string]: any };
  created_at: string;
}

// Core booking

export interface Booking {
  id: string;
  type: BookingType;
  parent_booking_id?: string;
  triggered_by_booking_id?: string;
  user_id: string;
  offer_id: string;
  status: BookingState;
  // Trip-specific fields (nullable for pass bookings)
  start_date?: string;
  duration_days?: number;
  accommodation_tier?: string;
  departure_city?: string;
  travelers: number;
  room_sharing: boolean;
  payment_mode: PaymentMode;
  payment_method_id?: string;
  pricing_snapshot?: PricingSnapshot | null;
  deposit_id?: string;
  trip_id?: string;
  cancel_reason?: string;
  cancellation_fee?: number;
  expires_at?: string;
  quoted_at?: string;
  details?: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface BookingDetail extends Booking {
  requirements: BookingRequirement[];
  installments: BookingInstallment[];
  events: BookingEvent[];
}

// Action results

export interface CancellationResult {
  booking_id: string;
  status: 'cancelled';
  cancellation_fee: number;
  refund_amount: number;
  refund_tx_id?: string;
}

export interface BookingExtension {
  booking: Booking;
  parent_booking_id: string;
}

// Paginated response

export interface BookingsList {
  bookings: Booking[];
  total: number;
  page: number;
  page_size: number;
}

// Request params

export interface CreateBookingParams {
  offer_id: string;
  booking_type?: BookingType;
  // Trip-specific (required for trip, optional for pass)
  start_date?: string;
  duration_days?: number;
  accommodation_tier?: string;
  departure_city?: string;
  travelers?: number;
  room_sharing?: boolean;
  payment_mode?: PaymentMode;
  // Pass-specific
  details?: { [key: string]: any };
  triggered_by_booking_id?: string;
}

export interface UpdateBookingOptionsParams {
  accommodation_tier?: string;
  departure_city?: string;
  travelers?: number;
  room_sharing?: boolean;
  payment_mode?: PaymentMode;
}

export interface CancelBookingParams {
  reason: string;
}

export interface ExtendBookingParams {
  extra_days: number;
}

export interface BookingsListParams {
  page?: number;
  page_size?: number;
  status?: BookingState;
  include_triggered?: boolean;
}

// Booking options (masterclass add-ons)

export type OptionStatus = 'proposed' | 'accepted' | 'paid' | 'delivered' | 'settled' | 'refunded' | 'expired' | 'cancelled';

export interface BookingOption {
  id: string;
  booking_id: string;
  option_type: string;
  masterclass_id: string;
  status: OptionStatus;
  price: number;
  expires_at?: string;
  paid_at?: string;
  delivered_at?: string;
  settled_at?: string;
  payout_at?: string;
  refund_amount?: number;
  escrow_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOptionParams {
  masterclass_id: string;
}

// Cancel preview (dry-run)

export type CancelPreviewAlertSeverity = 'info' | 'warning' | 'danger';

export interface CancelPreviewAlert {
  type: string;
  severity: CancelPreviewAlertSeverity;
  message: string;
  booking_ids?: string[];
}

export interface LinkedBookingPreview {
  id: string;
  type: BookingType;
  status: BookingState;
  offer_id: string;
  can_detach: boolean;
  cancellation_fee: number;
  refund_amount: number;
}

export interface CancelPreviewResult {
  booking_id: string;
  booking_type: BookingType;
  status: BookingState;
  cancellation_fee: number;
  amount_paid: number;
  refund_amount: number;
  linked_bookings: LinkedBookingPreview[];
  alerts: CancelPreviewAlert[];
}
