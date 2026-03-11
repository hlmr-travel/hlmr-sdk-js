// Types for terms module (user-facing signatures)

// Enums

export type DocumentType =
  | 'CGU'
  | 'RGPD'
  | 'CONDITIONS_APP'
  | 'CHARTE_CONDUITE'
  | 'CONTRAT_PRO'
  | 'COOKIE_POLICY'
  | 'INFO_ONLY';

export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';

export type SecurityLevel = 'CLICK' | 'SMS_CODE' | 'WHATSAPP_CODE' | 'EMAIL_CONFIRM';

export type UpdatePolicy =
  | 'REQUIRE_RESIGN'
  | 'GRACE_PERIOD_7D'
  | 'GRACE_PERIOD_30D'
  | 'NOTIFY_ONLY';

export type GeoZone = 'WORLDWIDE' | 'EU' | 'FR' | 'US';

export type SignerType = 'USER' | 'EMAIL' | 'SMS';

export type SignatureMethod = 'CLICK' | 'SMS_CODE' | 'WHATSAPP_CODE' | 'EMAIL_CONFIRM';

// Document (full response from API)

export interface TermsDocument {
  id: string;
  type: DocumentType;
  app_id: string | null;
  document_group_id: string | null;
  version: string;
  version_number: number;
  previous_version_id: string | null;
  language: string;
  title: string;
  content: string;
  content_hash: string;
  summary: string | null;
  geo_zones: GeoZone[];
  owner_id: string | null;
  is_public: boolean;
  slug: string | null;
  security_level: SecurityLevel;
  update_policy: UpdatePolicy;
  requires_all_users: boolean;
  expires_at: string | null;
  signature_opens_at: string | null;
  signature_closes_at: string | null;
  status: DocumentStatus;
  published_at: string | null;
  deprecated_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: Record<string, unknown> | null;
}

// Signature

export interface TermsSignature {
  id: string;
  signer_type: SignerType;
  signer_identifier: string;
  document_id: string;
  document_version: string;
  document_content_hash: string;
  document_title: string | null;
  document_type: string | null;
  signed_at: string;
  signature_method: SignatureMethod;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  accept_language: string | null;
  jwt_token_hash: string | null;
  signature_token: string | null;
  is_valid: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
}

// Signature check

export interface TermsSignatureCheck {
  is_signed: boolean;
  signature: TermsSignature | null;
  document_id: string;
  signed_document_id: string | null;
  current_document_version: string;
  signed_version: string | null;
  needs_resign: boolean;
}

// Pending document

export interface TermsPendingDocument {
  id: string;
  type: DocumentType;
  app_id: string | null;
  document_group_id: string | null;
  language: string;
  title: string;
  content: string;
  content_hash: string;
  summary: string | null;
  version: string;
  version_number: number;
  geo_zones: string[];
  status: DocumentStatus;
  security_level: SecurityLevel;
  update_policy: UpdatePolicy;
  signature_opens_at: string | null;
  signature_closes_at: string | null;
  published_at: string | null;
  created_at: string | null;
  reason: string;
  previous_signature: TermsSignature | null;
}

// Pending documents response

export interface TermsPendingDocumentsResponse {
  signer_type: SignerType;
  signer_identifier: string;
  app_id: string | null;
  geo_zone: string;
  pending_documents: TermsPendingDocument[];
  total_pending: number;
  blocking_count: number;
}

// Compliance

export interface TermsComplianceResponse {
  signer_type: SignerType;
  signer_identifier: string;
  app_id: string;
  geo_zone: string;
  is_compliant: boolean;
  missing_signatures: TermsPendingDocument[];
  grace_period_documents: TermsPendingDocument[];
  expired_signatures: TermsPendingDocument[];
  signed_documents_count: number;
  total_required_documents: number;
  compliance_percentage: number;
  checked_at: string;
}

// Paginated signatures

export interface TermsSignaturesList {
  signatures: TermsSignature[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Params

export interface SignDocumentParams {
  document_id: string;
  signer_type?: SignerType;
  signer_identifier?: string;
  signature_method?: SignatureMethod;
  verification_code?: string;
  device_fingerprint?: string;
}

export interface TermsSignaturesListParams {
  page?: number;
  page_size?: number;
  lang?: string;
}

// Document by group response (multi-language)

export interface TermsDocumentByGroupResponse {
  document: TermsDocument;
  available_languages: string[];
  requested_language: string;
  actual_language: string;
}

// Diff summary

export interface TermsDiffSummaryResponse {
  document_id: string;
  from_document_id: string;
  from_version: string;
  to_version: string;
  summary: string;
  summary_language: string;
  document_language: string;
  generated_at: string;
  ai_provider: string;
  ai_model?: string;
  cached: boolean;
  translated: boolean;
}

// Document signature history

export interface TermsSignatureHistoryItem {
  document_id: string;
  document_version: string;
  document_title: string;
  signature: {
    id: string;
    signed_at: string;
    is_valid: boolean;
  };
  signed_at: string;
  is_valid: boolean;
}

export interface TermsDocumentSignatureHistory {
  document_type: string;
  app_id: string;
  language: string;
  current_document_id: string;
  signatures: TermsSignatureHistoryItem[];
  total_signed_versions: number;
  total_versions: number;
}

// Pending documents params

export interface TermsPendingDocumentsParams {
  geo_zone?: string;
  lang?: string;
}
