// Types for subscription module

export type SubscriptionStatus = 'active' | 'expired' | 'renewed' | 'cancelled';

export type SubscriptionType = 'mira_pass';

export type SubscriptionTier =
  | 'super_early_bird'
  | 'early_bird'
  | 'late_early_bird'
  | 'normal';

export interface UserSubscription {
  id: string;
  type: SubscriptionType;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  is_founder: boolean;
  started_at: string | null;
  expires_at: string | null;
  continuous_since: string | null;
  provider_id: string | null;
  benefits: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionsList {
  subscriptions: UserSubscription[];
  total: number;
}

export interface SubscriptionHistoryParams {
  type?: SubscriptionType;
  limit?: number;
  offset?: number;
}
