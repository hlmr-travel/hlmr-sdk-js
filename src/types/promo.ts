// Types for promo module (vouchers + referral)

// ── Voucher types ──

export type DiscountType = 'percentage' | 'fixed';

export type VoucherInvalidReason =
  | 'not_found'
  | 'inactive'
  | 'expired'
  | 'not_yet_valid'
  | 'quota_exhausted'
  | 'per_user_limit'
  | 'offer_not_eligible'
  | 'min_order_not_met'
  | 'booking_type_not_eligible'
  | 'destination_not_eligible'
  | 'nationality_not_eligible'
  | 'rate_limited';

export interface VoucherCheckOptions {
  offer_id?: string;
  amount?: number;
  booking_type?: string;
}

export interface VoucherCheckResult {
  valid: boolean;
  voucher_id?: string;
  discount_amount?: number;
  discount_type?: DiscountType;
  reason?: VoucherInvalidReason;
}

// ── Referral types ──

export interface ReferralRewardTier {
  rank: number;
  amount_eur: number;
  label: string;
}

export interface ReferralCode {
  code: string;
  share_url: string;
  total_enrollments: number;
  total_confirmed: number;
  total_rewards_eur: number;
  reward_tiers: ReferralRewardTier[];
  is_active: boolean;
}

export interface ReferralReward {
  id: string;
  referral_rank: number;
  amount_eur: number;
  reward_type: string;
  status: 'pending' | 'issued' | 'failed';
  issued_at: string | null;
  created_at: string | null;
}

export interface ReferralRewardsList {
  rewards: ReferralReward[];
}

export interface ReferralEnrollmentResult {
  enrollment_id: string;
  referrer_user_id: string;
  expires_at: string;
}
