// Types for ledger module — wallets, transactions, invariant, stats

// ── Enums (string unions) ──────────────────────────────────────────

export type WalletType =
  | 'input'
  | 'output'
  | 'hlmr'
  | 'hlmr_travel'
  | 'user'
  | 'user_deposit'
  | 'user_credits'
  | 'trip'
  | 'activity';

export type WalletStatus = 'active' | 'closed' | 'suspended';

export type HostingPhase = 'user_hosted' | 'subsidiary_hosted';

export type Currency = 'EUR';

export type TransactionStatus = 'pending' | 'done' | 'cancelled' | 'failed';

export type TransactionLabel =
  | 'top_up'
  | 'subscription_payment'
  | 'trip_funding'
  | 'trip_expense'
  | 'activity_payment'
  | 'deposit_collection'
  | 'deposit_release'
  | 'credit_grant'
  | 'credit_usage'
  | 'withdrawal'
  | 'payout'
  | 'intercompany_transfer'
  | 'migration'
  | 'closure_sweep'
  | string;

// ── Core entities ──────────────────────────────────────────────────

export interface Wallet {
  id: string;
  type: WalletType;
  status: WalletStatus;
  currency: Currency;
  amount: number;
  version: number;
  owner_id?: string | null;
  name?: string | null;
  meta?: Record<string, unknown> | null;
  hosting_phase?: HostingPhase | null;
  target_amount?: number | null;
  alert_threshold?: number | null;
  expires_at?: string | null;
  reference_id?: string | null;
  provider_id?: string | null;
  provider_wallet_id?: string | null;
  min_balance?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  sender_id: string;
  recipient_id: string;
  sender_type?: string | null;
  recipient_type?: string | null;
  label: string;
  description?: string | null;
  idempotency_key?: string | null;
  linked_group?: string | null;
  scheduled_at?: string | null;
  date?: string | null;
  converted_amount?: number | null;
  converted_currency?: string | null;
  exchange_rate?: number | null;
  exchange_rate_date?: string | null;
  meta?: Record<string, unknown> | null;
  initiated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ── Request params ─────────────────────────────────────────────────

export interface WalletCreate {
  type: WalletType;
  currency?: Currency;
  owner_id?: string;
  name?: string;
  meta?: Record<string, unknown>;
  hosting_phase?: HostingPhase;
  target_amount?: number;
  alert_threshold?: number;
  expires_at?: string;
  reference_id?: string;
  provider_id?: string;
  provider_wallet_id?: string;
  min_balance?: number;
}

export interface TransactionCreate {
  amount: number;
  currency?: Currency;
  sender_id: string;
  recipient_id: string;
  label: string;
  description?: string;
  idempotency_key?: string;
  linked_group?: string;
  scheduled_at?: string;
  meta?: Record<string, unknown>;
  initiated_by?: string;
  auto_execute?: boolean;
}

// ── List params ────────────────────────────────────────────────────

export interface WalletsListParams {
  page?: number;
  page_size?: number;
  type?: WalletType;
  status?: WalletStatus;
  owner_id?: string;
  reference_id?: string;
  provider_wallet_id?: string;
  currency?: Currency;
  'meta.trip_id'?: string;
  'meta.group_id'?: string;
  'meta.activity_id'?: string;
}

export interface TransactionsListParams {
  page?: number;
  page_size?: number;
  label?: string;
  status?: TransactionStatus;
  wallet_id?: string;
  sender_id?: string;
  recipient_id?: string;
  linked_group?: string;
  date_from?: string;
  date_to?: string;
}

export interface TransactionStatsParams {
  from?: string;
  to?: string;
  granularity?: 'hour' | 'day' | 'week';
}

export interface BalanceHistoryParams {
  page?: number;
  page_size?: number;
}

// ── Paginated responses ────────────────────────────────────────────

export interface WalletsList {
  wallets: Wallet[];
  total: number;
  page: number;
  page_size: number;
}

export interface TransactionsList {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

// ── Invariant ──────────────────────────────────────────────────────

export interface InvariantCheck {
  valid: boolean;
  sum: number;
  wallet_count: number;
  checked_at: string;
}

// ── Balance history ────────────────────────────────────────────────

export interface BalanceHistoryEntry {
  timestamp: string;
  transaction_id: string;
  label: string;
  delta: number;
  amount: number;
  status: string;
}

export interface BalanceHistoryList {
  history: BalanceHistoryEntry[];
  total: number;
  page: number;
  page_size: number;
}

// ── Stats ──────────────────────────────────────────────────────────

export interface WalletStatsByType {
  type: WalletType;
  count: number;
  total_amount: number;
}

export interface WalletStatsByStatus {
  status: WalletStatus;
  count: number;
}

export interface WalletStats {
  by_type: WalletStatsByType[];
  by_status: WalletStatsByStatus[];
  total_count: number;
}

export interface TransactionStatsByStatus {
  status: TransactionStatus;
  count: number;
}

export interface TransactionStatsByPeriod {
  date: string;
  count: number;
  volume: number;
}

export interface TransactionStats {
  by_status: TransactionStatsByStatus[];
  total_volume_done: number;
  by_period: TransactionStatsByPeriod[];
}
