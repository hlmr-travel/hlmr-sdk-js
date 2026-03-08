import type { HttpClient } from '../utils/http';
import type {
  CreatePaymentLinkParams,
  FreePaymentLinkResult,
  ListPaymentLinksParams,
  PaymentLinkInfo,
  PaymentLinkStatusInfo,
  PaymentLinksList,
} from '../types/payment';

export class PaymentModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /** Get public info of a payment link (no auth required, token sent if available). */
  async getLink(token: string): Promise<PaymentLinkInfo> {
    const response = await this.http.get<PaymentLinkInfo>(
      `payment/public/links/${token}`,
      { skipAuth: true },
    );
    return response.data;
  }

  /** Get status of a payment link (no auth required). */
  async getLinkStatus(token: string): Promise<PaymentLinkStatusInfo> {
    const response = await this.http.get<PaymentLinkStatusInfo>(
      `payment/public/links/${token}/status`,
      { skipAuth: true },
    );
    return response.data;
  }

  /** Create a free-form payment link (auth required). */
  async createLink(params: CreatePaymentLinkParams = {}): Promise<FreePaymentLinkResult> {
    const response = await this.http.post<FreePaymentLinkResult>(
      'payment/links/free',
      params,
    );
    return response.data;
  }

  /** Cancel a pending payment link (auth required). */
  async cancelLink(linkId: string): Promise<{ id: string; status: string }> {
    const response = await this.http.post<{ id: string; status: string }>(
      `payment/links/${linkId}/cancel`,
    );
    return response.data;
  }

  /** List payment links created by the authenticated user (auth required). */
  async listLinks(params: ListPaymentLinksParams = {}): Promise<PaymentLinksList> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));

    const qs = query.toString();
    const path = qs ? `payment/links?${qs}` : 'payment/links';

    const response = await this.http.get<PaymentLinksList>(path);
    return response.data;
  }
}
