import type { HttpClient } from '../utils/http';
import type { PriceEstimate, PriceEstimateParams } from '../types/pricing';

export class PricingModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async estimate(params: PriceEstimateParams): Promise<PriceEstimate> {
    const response = await this.http.post<PriceEstimate>('pricing/estimate', params);
    return response.data;
  }
}
