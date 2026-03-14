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
  AuthValidateRedirectResponse,
  ExchangeRedirectTokenResponse
} from './types/auth';

export type {
  UserEmail,
  UserPhone,
  UserIdentity,
  UserProfile,
  UserSettings,
  ProfileUpdateParams
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
  OfferType,
  PricingType,
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
  OfferSortBy,
  SortOrder,
  SearchOffersParams,
  SearchOffersResult,
  OfferAvailabilityDay,
  OfferAvailabilityParams,
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
  NoticeSeverity,
  NoticeTheme,
  NoticeMetadata,
  InstallmentStatus,
  PromoApplied,
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
  QuoteParams,
  ConfirmQuoteParams,
  InsufficientBalanceDetail,
  UpdateBookingOptionsParams,
  CancelReasonType,
  CancelBookingParams,
  ExtendBookingParams,
  BookingsListParams,
  OptionStatus,
  BookingOption,
  CreateOptionParams,
  CancelPreviewAlertSeverity,
  CancelPreviewAlert,
  LinkedBookingPreview,
  CancellationScheduleTier,
  CancelPreviewResult,
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

// Terms module (user-facing signatures)
export { TermsModule } from './modules/terms';

// Terms types
export type {
  DocumentType,
  DocumentStatus,
  SecurityLevel,
  UpdatePolicy,
  GeoZone,
  SignerType,
  SignatureMethod,
  TermsDocument,
  TermsSignature,
  TermsSignatureCheck,
  TermsPendingDocument,
  TermsPendingDocumentsResponse,
  TermsComplianceResponse,
  TermsSignaturesList,
  SignDocumentParams,
  TermsSignaturesListParams,
  TermsDocumentByGroupResponse,
  TermsDiffSummaryResponse,
  TermsSignatureHistoryItem,
  TermsDocumentSignatureHistory,
  TermsPendingDocumentsParams,
} from './types/terms';

// Promo module (vouchers + referral)
export { PromoModule } from './modules/promo';

// Promo types
export type {
  DiscountType,
  VoucherInvalidReason,
  VoucherCheckOptions,
  VoucherCheckResult,
  ReferralRewardTier,
  ReferralCode,
  ReferralReward,
  ReferralRewardsList,
  ReferralEnrollmentResult,
} from './types/promo';

// Payment module
export { PaymentModule } from './modules/payment';

// Payment types
export type {
  PaymentScope,
  PaymentLinkStatus,
  PayerType,
  PaymentLinkResult,
  FreePaymentLinkResult,
  CreatePaymentLinkParams,
  ListPaymentLinksParams,
  PaymentLinksList,
  PaymentLinkListItem,
  PaymentLinkInfo,
  PaymentLinkBookingSummary,
  PaymentLinkStatusInfo,
  PaymentLink,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
  PayBookingParams,
  RenewPaymentLinkResult,
} from './types/payment';

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

// Subscription module (Mira Pass)
export { SubscriptionModule } from './modules/subscription';

// Subscription types
export type {
  SubscriptionStatus,
  SubscriptionType,
  SubscriptionTier,
  UserSubscription,
  UserSubscriptionsList,
  SubscriptionHistoryParams,
} from './types/subscription';

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
