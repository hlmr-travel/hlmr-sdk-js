import { HttpClient } from '../../src/utils/http';
import { OffersModule } from '../../src/modules/offers';

jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('OffersModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let mod: OffersModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    mod = new OffersModule(httpClient);
  });

  it('list without params', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { offers: [], total: 0, page: 1, page_size: 10 } });
    await mod.list();
    expect(httpClient.get).toHaveBeenCalledWith('offers/offers');
  });

  it('list with params', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { offers: [], total: 0, page: 1, page_size: 10 } });
    await mod.list({ page: 2, country: 'FRA' });
    const call = httpClient.get.mock.calls[0];
    expect(call[0]).toContain('offers/offers?');
    expect(call[0]).toContain('page=2');
    expect(call[0]).toContain('country=FRA');
  });

  it('list does not use skipAuth', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { offers: [], total: 0, page: 1, page_size: 10 } });
    await mod.list();
    // No options (no skipAuth)
    expect(httpClient.get).toHaveBeenCalledWith('offers/offers');
  });
});
