import type { HttpClient } from '../utils/http';
import type {
  PaymentLinkInfo,
  PaymentLinkStatusInfo,
} from '../types/payment';

export class PaymentModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getLink(token: string): Promise<PaymentLinkInfo> {
    const response = await this.http.get<PaymentLinkInfo>(
      `payment/links/${token}`,
      { skipAuth: true },
    );
    return response.data;
  }

  async getLinkStatus(token: string): Promise<PaymentLinkStatusInfo> {
    const response = await this.http.get<PaymentLinkStatusInfo>(
      `payment/links/${token}/status`,
      { skipAuth: true },
    );
    return response.data;
  }
}
