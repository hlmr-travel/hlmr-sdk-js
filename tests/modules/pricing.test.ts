import { HttpClient } from '../../src/utils/http';
import { PricingModule } from '../../src/modules/pricing';

jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('PricingModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let mod: PricingModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    mod = new PricingModule(httpClient);
  });

  it('estimate sends POST with params', async () => {
    const mockEstimate = { total: 185000, deposit_target: 18500, breakdown: { steps: [] }, payment_options: [] };
    httpClient.post.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: mockEstimate });

    const params = {
      offer_id: 'ofr_1',
      start_date: '2026-07-01',
      duration_days: 30,
      accommodation_tier: 'hotel_3',
      departure_city: 'Paris',
      travelers: 1,
      room_sharing: false,
    };

    const result = await mod.estimate(params);
    expect(httpClient.post).toHaveBeenCalledWith('pricing/estimate', params);
    expect(result.total).toBe(185000);
  });
});
