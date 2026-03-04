import { HttpClient } from '../../src/utils/http';
import { BookingModule } from '../../src/modules/booking';

jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

const mockResponse = (data: any) => ({ status: 200, statusText: 'OK', headers: {}, data });

describe('BookingModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let mod: BookingModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    mod = new BookingModule(httpClient);
  });

  it('create sends POST to booking/bookings', async () => {
    const params = { offer_id: 'ofr_1', start_date: '2026-07-01', duration_days: 30, accommodation_tier: 'hotel_3', departure_city: 'Paris', travelers: 1, room_sharing: false, payment_mode: 'oneshot' as const };
    httpClient.post.mockResolvedValue(mockResponse({ id: 'bkg_1', status: 'intent' }));
    const result = await mod.create(params);
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings', params);
    expect(result.id).toBe('bkg_1');
  });

  it('quote sends POST with booking ID', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ id: 'bkg_1', status: 'quoted' }));
    await mod.quote('bkg_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/quote');
  });

  it('updateOptions sends PUT', async () => {
    httpClient.put.mockResolvedValue(mockResponse({ id: 'bkg_1' }));
    await mod.updateOptions('bkg_1', { accommodation_tier: 'hotel_4' });
    expect(httpClient.put).toHaveBeenCalledWith('booking/bookings/bkg_1/options', { accommodation_tier: 'hotel_4' });
  });

  it('confirmQuote sends POST', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ id: 'bkg_1', status: 'pending' }));
    await mod.confirmQuote('bkg_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/confirm-quote');
  });

  it('checkRequirement sends POST with type path param', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ id: 'req_1', type: 'terms_acceptance', status: 'completed' }));
    await mod.checkRequirement('bkg_1', 'terms_acceptance');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/requirements/terms_acceptance/check');
  });

  it('list sends GET with optional params', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ bookings: [], total: 0, page: 1, page_size: 10 }));
    await mod.list({ status: 'confirmed', page: 2 });
    const call = httpClient.get.mock.calls[0][0];
    expect(call).toContain('booking/bookings?');
    expect(call).toContain('status=confirmed');
    expect(call).toContain('page=2');
  });

  it('get returns BookingDetail', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ id: 'bkg_1', requirements: [], installments: [], events: [] }));
    const result = await mod.get('bkg_1');
    expect(httpClient.get).toHaveBeenCalledWith('booking/bookings/bkg_1');
    expect(result.requirements).toEqual([]);
  });

  it('getRequirements returns array', async () => {
    httpClient.get.mockResolvedValue(mockResponse([{ id: 'req_1', type: 'mira_pass' }]));
    const result = await mod.getRequirements('bkg_1');
    expect(httpClient.get).toHaveBeenCalledWith('booking/bookings/bkg_1/requirements');
    expect(result).toHaveLength(1);
  });

  it('cancel sends POST with reason', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking_id: 'bkg_1', status: 'cancelled', cancellation_fee: 0, refund_amount: 185000 }));
    await mod.cancel('bkg_1', { reason: 'Changed plans' });
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/cancel', { reason: 'Changed plans' });
  });

  it('extend sends POST with extra_days', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_ext_1' }, parent_booking_id: 'bkg_1' }));
    await mod.extend('bkg_1', { extra_days: 14 });
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/extend', { extra_days: 14 });
  });

  it('confirmExtension sends POST', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ id: 'bkg_ext_1', status: 'confirmed' }));
    await mod.confirmExtension('bkg_ext_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_ext_1/confirm-extension');
  });
});
