import type { HttpClient } from '../utils/http';
import type {
  UserSubscription,
  UserSubscriptionsList,
  SubscriptionHistoryParams,
} from '../types/subscription';

export class SubscriptionModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Get the active subscription of the authenticated user.
   * Returns null if no active subscription.
   */
  async getMySubscription(): Promise<UserSubscription | null> {
    const response = await this.http.get<{ subscription: UserSubscription | null }>(
      'subscriptions/me',
    );
    return response.data.subscription;
  }

  /**
   * Get subscription history of the authenticated user.
   */
  async getMyHistory(params?: SubscriptionHistoryParams): Promise<UserSubscriptionsList> {
    const query = params
      ? '?' + Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join('&')
      : '';
    const response = await this.http.get<UserSubscriptionsList>(
      `subscriptions/me/history${query}`,
    );
    return response.data;
  }
}
