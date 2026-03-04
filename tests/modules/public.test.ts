import { HttpClient } from '../../src/utils/http';
import { PublicModule } from '../../src/modules/public';

jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('PublicModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let mod: PublicModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    mod = new PublicModule(httpClient);
  });

  it('listOffers without params', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { offers: [], total: 0, page: 1, page_size: 10 } });
    const result = await mod.listOffers();
    expect(httpClient.get).toHaveBeenCalledWith('offers/public/offers', { skipAuth: true });
    expect(result.offers).toEqual([]);
  });

  it('listOffers with params', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { offers: [], total: 0, page: 1, page_size: 10 } });
    await mod.listOffers({ page: 2, country: 'ESP' });
    const call = httpClient.get.mock.calls[0];
    expect(call[0]).toContain('offers/public/offers?');
    expect(call[0]).toContain('page=2');
    expect(call[0]).toContain('country=ESP');
    expect(call[1]).toEqual({ skipAuth: true });
  });

  it('getOffer', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { id: 'ofr_1', title: 'Test' } });
    const result = await mod.getOffer('ofr_1');
    expect(httpClient.get).toHaveBeenCalledWith('offers/public/offers/ofr_1', { skipAuth: true });
    expect(result.id).toBe('ofr_1');
  });

  it('listDestinations targets geo service', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { destinations: [], total: 0, page: 1, page_size: 10 } });
    await mod.listDestinations();
    expect(httpClient.get).toHaveBeenCalledWith('geo/public/destinations', { skipAuth: true });
  });

  it('listCities targets geo service', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { cities: [], total: 0, page: 1, page_size: 10 } });
    await mod.listCities({ destination_id: 'dest_1' });
    const call = httpClient.get.mock.calls[0];
    expect(call[0]).toContain('geo/public/cities?');
    expect(call[0]).toContain('destination_id=dest_1');
    expect(call[1]).toEqual({ skipAuth: true });
  });

  it('listDocuments targets terms service', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { documents: [], total: 0, page: 1, page_size: 10 } });
    await mod.listDocuments();
    expect(httpClient.get).toHaveBeenCalledWith('terms/public/documents', { skipAuth: true });
  });

  it('getDocument targets terms service', async () => {
    httpClient.get.mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, data: { id: 'doc_1', content: 'text' } });
    const result = await mod.getDocument('doc_1');
    expect(httpClient.get).toHaveBeenCalledWith('terms/public/documents/doc_1', { skipAuth: true });
    expect(result.id).toBe('doc_1');
  });
});
