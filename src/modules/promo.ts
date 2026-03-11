import type { HttpClient } from '../utils/http';
import type {
  ReferralCode,
  ReferralEnrollmentResult,
  ReferralRewardsList,
  VoucherCheckOptions,
  VoucherCheckResult,
} from '../types/promo';

export class PromoModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /** Check if a voucher code is valid (auth required). */
  async checkVoucher(code: string, options?: VoucherCheckOptions): Promise<VoucherCheckResult> {
    const query = new URLSearchParams({ code });
    if (options?.offer_id) query.set('offer_id', options.offer_id);
    if (options?.amount !== undefined) query.set('amount', String(options.amount));
    if (options?.booking_type) query.set('booking_type', options.booking_type);

    const response = await this.http.get<VoucherCheckResult>(
      `promo/vouchers/check?${query.toString()}`,
    );
    return response.data;
  }

  /** Get or generate the user's personal referral code (auth required). */
  async getMyReferralCode(firstName?: string): Promise<ReferralCode> {
    const query = firstName ? `?first_name=${encodeURIComponent(firstName)}` : '';
    const response = await this.http.get<ReferralCode>(
      `promo/referral/my-code${query}`,
    );
    return response.data;
  }

  /** List the user's referral rewards (auth required). */
  async getMyRewards(): Promise<ReferralRewardsList> {
    const response = await this.http.get<ReferralRewardsList>(
      'promo/referral/my-rewards',
    );
    return response.data;
  }

  /** Enroll as a referee with a referral code (auth required). */
  async enrollWithReferralCode(code: string): Promise<ReferralEnrollmentResult> {
    const response = await this.http.post<ReferralEnrollmentResult>(
      'promo/referral/enroll',
      { code },
    );
    return response.data;
  }
}
