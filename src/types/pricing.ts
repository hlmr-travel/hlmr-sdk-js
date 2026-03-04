// Types for pricing module

export interface PriceStep {
  step: number;
  label: string;
  direction: '+' | '-' | 'x';
  amount: number;
  subtotal: number;
}

export interface PriceBreakdown {
  steps: PriceStep[];
}

export interface PaymentInstallmentPreview {
  due_date: string;
  amount: number;
  label: string;
}

export interface PaymentOption {
  mode: 'oneshot' | 'monthly';
  total: number;
  discount_applied?: number;
  installments?: PaymentInstallmentPreview[];
}

export interface PriceEstimate {
  total: number;
  deposit_target: number;
  breakdown: PriceBreakdown;
  payment_options: PaymentOption[];
}

export interface PriceEstimateParams {
  offer_id: string;
  start_date: string;
  duration_days: number;
  accommodation_tier: string;
  departure_city: string;
  travelers: number;
  room_sharing: boolean;
}
