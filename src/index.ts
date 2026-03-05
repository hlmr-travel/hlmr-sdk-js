/**
 * SDK JavaScript officiel pour l'API Mira
 * Routes publiques uniquement - Version publique
 * 
 * @version 1.1.0
 * @author CES Venture (Hello Mira)
 */

// Client principal
export { HlmrClient } from './client/HlmrClient';

// Types publics
export type {
  HlmrClientConfig,
  HlmrClientOptions,
  Environment
} from './types/common';

export type {
  AuthValidateRedirectRequest,
  AuthValidateRedirectResponse
} from './types/auth';

export type {
  UserProfile,
  UserSettings
} from './types/user';

export type {
  SystemPingResponse,
  SystemPingOptions,
  SystemVersionResponse
} from './types/system';

export type {
  LogSessionOptions,
  LogSessionResponse
} from './modules/apps';

export { AppsModule } from './modules/apps';

// New modules (booking flow)
export { PublicModule } from './modules/public';
export { OffersModule } from './modules/offers';
export { PricingModule } from './modules/pricing';
export { BookingModule } from './modules/booking';

// Events module (WebSocket)
export { EventsModule } from './modules/events';

export type {
  Subscription,
  SubscriptionOptions,
  SubscriptionFilters,
  EventNotification,
  SystemNotification,
  ConnectedMessage,
  SubscriptionConfirmedMessage,
  UnsubscribedMessage,
  ErrorMessage,
  WebSocketMessage,
  EventsModuleConfig,
  EventsModuleEvents
} from './types/events';

// Offers types
export type {
  OfferStatus,
  AccommodationTierEnum,
  TermTypeEnum,
  OfferSeason,
  OfferAccommodationTier,
  OfferFlightTier,
  OfferDurationDiscount,
  OfferTerm,
  OfferEligibility,
  PublicOffer,
  PublicOfferDetail,
  Offer,
  PublicOffersList,
  OffersList,
  PublicOffersListParams,
  OffersListParams,
} from './types/offers';

// Pricing types
export type {
  PriceStep,
  PriceBreakdown,
  PaymentInstallmentPreview,
  PaymentOption,
  PriceEstimate,
  PriceEstimateParams,
} from './types/pricing';

// Booking types
export type {
  BookingState,
  BookingType,
  PaymentMode,
  RequirementType,
  RequirementStatus,
  InstallmentStatus,
  PricingSnapshot,
  BookingRequirement,
  BookingInstallment,
  BookingEvent,
  Booking,
  BookingDetail,
  CancellationResult,
  BookingExtension,
  BookingsList,
  CreateBookingParams,
  UpdateBookingOptionsParams,
  CancelBookingParams,
  ExtendBookingParams,
  BookingsListParams,
} from './types/booking';

// Public types (geo, terms)
export type {
  PublicDestination,
  PublicCity,
  PublicDocumentSummary,
  PublicDocument,
  PublicDestinationsList,
  PublicCitiesList,
  PublicDocumentsList,
  PublicDestinationsListParams,
  PublicCitiesListParams,
  PublicDocumentsListParams,
} from './types/public';

// Ledger module
export { LedgerModule } from './modules/ledger';

// Ledger types
export type {
  WalletType,
  WalletStatus,
  HostingPhase,
  Currency,
  TransactionStatus,
  TransactionLabel,
  Wallet,
  Transaction,
  WalletCreate,
  TransactionCreate,
  WalletsListParams,
  TransactionsListParams,
  TransactionStatsParams,
  BalanceHistoryParams,
  WalletsList,
  TransactionsList,
  InvariantCheck,
  BalanceHistoryEntry,
  BalanceHistoryList,
  WalletStatsByType,
  WalletStatsByStatus,
  WalletStats,
  TransactionStatsByStatus,
  TransactionStatsByPeriod,
  TransactionStatsByPeriodLabel,
  TransactionStats,
} from './types/ledger';

// Classes d'erreur (valeurs)
export { HlmrApiError } from './types/errors';

// Types d'erreur
export type {
  JSendResponse,
  JSendSuccessResponse,
  JSendFailResponse,
  JSendErrorResponse
} from './types/errors';

export type {
  HttpClient
} from './utils/http';

// Utilitaires publics
export { isJSendResponse, isJSendSuccess, isJSendFail, isJSendError } from './utils/jsend';

// Utilitaires d'authentification
export { clearAllCache, preventBackNavigation, performLogout } from './utils/auth';
export type { LogoutOptions } from './utils/auth';

// Version du SDK
export { SDK_VERSION, SDK_NAME } from './constants';

// Supabase client unifié
export {
  getSupabaseClient,
  resetSupabaseClient,
  getSupabaseClientConfig
} from './lib/supabaseClient';
export type { SupabaseClientOptions } from './lib/supabaseClient';
