import type { HttpClient } from '../utils/http';
import type {
  TermsDocument,
  TermsSignature,
  TermsSignatureCheck,
  TermsSignaturesList,
  TermsSignaturesListParams,
  TermsPendingDocumentsResponse,
  TermsPendingDocumentsParams,
  TermsComplianceResponse,
  TermsDocumentByGroupResponse,
  TermsDiffSummaryResponse,
  TermsDocumentSignatureHistory,
  SignDocumentParams,
} from '../types/terms';

const DOCS = 'terms/documents';
const SIGS = 'terms/signatures';

export class TermsModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // ── Documents (read-only, requires terms:read) ──

  async getDocument(documentId: string): Promise<TermsDocument> {
    const response = await this.http.get<{ document: TermsDocument }>(`${DOCS}/${documentId}`);
    return response.data.document;
  }

  async getDocumentByGroup(groupId: string, lang?: string): Promise<TermsDocumentByGroupResponse> {
    const query = lang ? `?lang=${lang}` : '';
    const response = await this.http.get<TermsDocumentByGroupResponse>(`${DOCS}/by-group/${groupId}${query}`);
    return response.data;
  }

  async getDiffSummary(documentId: string, fromVersionId: string, lang?: string): Promise<TermsDiffSummaryResponse> {
    const params = new URLSearchParams({ from_version_id: fromVersionId });
    if (lang) params.append('lang', lang);
    const response = await this.http.get<TermsDiffSummaryResponse>(`${DOCS}/${documentId}/diff-summary?${params}`);
    return response.data;
  }

  // ── Signatures ──

  async sign(params: SignDocumentParams): Promise<TermsSignature> {
    const response = await this.http.post<{ signature: TermsSignature }>(SIGS, params);
    return response.data.signature;
  }

  async listSignatures(params?: TermsSignaturesListParams): Promise<TermsSignaturesList> {
    const query = buildQueryString(params);
    const path = query ? `${SIGS}?${query}` : SIGS;
    const response = await this.http.get<TermsSignaturesList>(path);
    return response.data;
  }

  async getSignature(signatureId: string): Promise<TermsSignature> {
    const response = await this.http.get<{ signature: TermsSignature }>(`${SIGS}/${signatureId}`);
    return response.data.signature;
  }

  // ── Pending & Compliance ──

  async getPendingDocuments(params?: TermsPendingDocumentsParams): Promise<TermsPendingDocumentsResponse> {
    const query = buildQueryString(params);
    const path = query ? `${SIGS}/pending?${query}` : `${SIGS}/pending`;
    const response = await this.http.get<TermsPendingDocumentsResponse>(path);
    return response.data;
  }

  async getCompliance(geoZone?: string): Promise<TermsComplianceResponse> {
    const query = geoZone ? `?geo_zone=${geoZone}` : '';
    const response = await this.http.get<TermsComplianceResponse>(`${SIGS}/compliance${query}`);
    return response.data;
  }

  async checkSignature(documentId: string): Promise<TermsSignatureCheck> {
    const response = await this.http.get<TermsSignatureCheck>(`${SIGS}/check/${documentId}`);
    return response.data;
  }

  async getDocumentSignatureHistory(documentId: string): Promise<TermsDocumentSignatureHistory> {
    const response = await this.http.get<TermsDocumentSignatureHistory>(`${SIGS}/document/${documentId}/history`);
    return response.data;
  }
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
