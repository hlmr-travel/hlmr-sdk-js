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

  it('create sends POST and unwraps booking', async () => {
    const params = { offer_id: 'ofr_1', start_date: '2026-07-01', duration_days: 30, accommodation_tier: 'hotel_3', departure_city: 'Paris', travelers: 1, room_sharing: false, payment_mode: 'oneshot' as const };
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_1', status: 'intent' } }));
    const result = await mod.create(params);
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings', params);
    expect(result.id).toBe('bkg_1');
  });

  it('quote sends POST and unwraps quote', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ quote: { id: 'bkg_1', status: 'quoted', pricing_snapshot: {} } }));
    const result = await mod.quote('bkg_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/quote');
    expect(result.status).toBe('quoted');
  });

  it('updateOptions sends PUT and unwraps booking', async () => {
    httpClient.put.mockResolvedValue(mockResponse({ booking: { id: 'bkg_1' } }));
    const result = await mod.updateOptions('bkg_1', { accommodation_tier: 'hotel_4' });
    expect(httpClient.put).toHaveBeenCalledWith('booking/bookings/bkg_1/options', { accommodation_tier: 'hotel_4' });
    expect(result.id).toBe('bkg_1');
  });

  it('confirmQuote sends POST and unwraps booking', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_1', status: 'pending' } }));
    const result = await mod.confirmQuote('bkg_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/confirm-quote');
    expect(result.status).toBe('pending');
  });

  it('checkRequirement sends POST and unwraps requirement', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ requirement: { id: 'req_1', type: 'terms_acceptance', status: 'completed' } }));
    const result = await mod.checkRequirement('bkg_1', 'terms_acceptance');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/requirements/terms_acceptance/check');
    expect(result.id).toBe('req_1');
  });

  it('list sends GET with optional params', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ bookings: [], total: 0, page: 1, page_size: 10 }));
    await mod.list({ status: 'confirmed', page: 2 });
    const call = httpClient.get.mock.calls[0][0];
    expect(call).toContain('booking/bookings?');
    expect(call).toContain('status=confirmed');
    expect(call).toContain('page=2');
  });

  it('get returns unwrapped BookingDetail', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ booking: { id: 'bkg_1', requirements: [], installments: [], events: [] } }));
    const result = await mod.get('bkg_1');
    expect(httpClient.get).toHaveBeenCalledWith('booking/bookings/bkg_1');
    expect(result.requirements).toEqual([]);
  });

  it('getRequirements returns unwrapped array', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ requirements: [{ id: 'req_1', type: 'mira_pass' }] }));
    const result = await mod.getRequirements('bkg_1');
    expect(httpClient.get).toHaveBeenCalledWith('booking/bookings/bkg_1/requirements');
    expect(result).toHaveLength(1);
  });

  it('cancel sends POST and unwraps booking', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_1', status: 'cancelled' } }));
    const result = await mod.cancel('bkg_1', { reason: 'Changed plans' });
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/cancel', { reason: 'Changed plans' });
    expect(result.status).toBe('cancelled');
  });

  it('extend sends POST and unwraps booking', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_ext_1', type: 'trip_extension' } }));
    const result = await mod.extend('bkg_1', { extra_days: 14 });
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/extend', { extra_days: 14 });
    expect(result.id).toBe('bkg_ext_1');
  });

  it('confirmExtension sends POST and unwraps booking', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_ext_1', status: 'confirmed' } }));
    const result = await mod.confirmExtension('bkg_ext_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_ext_1/confirm-extension');
    expect(result.status).toBe('confirmed');
  });

  // Booking options (masterclass add-ons)

  it('createOption sends POST and unwraps option', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ option: { id: 'bop_1', status: 'proposed', masterclass_id: 'mcl_1' } }));
    const result = await mod.createOption('bkg_1', { masterclass_id: 'mcl_1' });
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/options', { masterclass_id: 'mcl_1' });
    expect(result.id).toBe('bop_1');
    expect(result.status).toBe('proposed');
  });

  it('acceptOption sends POST and unwraps option', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ option: { id: 'bop_1', status: 'accepted' } }));
    const result = await mod.acceptOption('bkg_1', 'bop_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/options/bop_1/accept');
    expect(result.status).toBe('accepted');
  });

  it('cancelOption sends POST and unwraps option', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ option: { id: 'bop_1', status: 'cancelled' } }));
    const result = await mod.cancelOption('bkg_1', 'bop_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/options/bop_1/cancel');
    expect(result.status).toBe('cancelled');
  });

  it('payOption sends POST and unwraps option', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ option: { id: 'bop_1', status: 'paid' } }));
    const result = await mod.payOption('bkg_1', 'bop_1');
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings/bkg_1/options/bop_1/pay');
    expect(result.status).toBe('paid');
  });

  it('listBookingOptions sends GET and unwraps options array', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ options: [{ id: 'bop_1' }, { id: 'bop_2' }] }));
    const result = await mod.listBookingOptions('bkg_1');
    expect(httpClient.get).toHaveBeenCalledWith('booking/bookings/bkg_1/options');
    expect(result).toHaveLength(2);
  });

  it('create with booking_type pass sends correct params', async () => {
    const params = { offer_id: 'ofr_pass_1', booking_type: 'pass' as const, details: { pass_tier: 'explorer' } };
    httpClient.post.mockResolvedValue(mockResponse({ booking: { id: 'bkg_pass_1', type: 'pass' } }));
    const result = await mod.create(params);
    expect(httpClient.post).toHaveBeenCalledWith('booking/bookings', params);
    expect(result.type).toBe('pass');
  });
});
