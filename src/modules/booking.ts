import type { HttpClient } from '../utils/http';
import type {
  Booking,
  BookingDetail,
  BookingRequirement,
  BookingsList,
  BookingsListParams,
  CreateBookingParams,
  UpdateBookingOptionsParams,
  CancelBookingParams,
  ExtendBookingParams,
  RequirementType,
} from '../types/booking';
import type {
  PayBookingParams,
  PaymentLinkResult,
  RenewPaymentLinkResult,
} from '../types/payment';

export class BookingModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async create(params: CreateBookingParams): Promise<Booking> {
    const response = await this.http.post<{ booking: Booking }>('booking/bookings', params);
    return response.data.booking;
  }

  async quote(bookingId: string): Promise<any> {
    const response = await this.http.post<{ quote: any }>(`booking/bookings/${bookingId}/quote`);
    return response.data.quote;
  }

  async updateOptions(bookingId: string, options: UpdateBookingOptionsParams): Promise<Booking> {
    const response = await this.http.put<{ booking: Booking }>(`booking/bookings/${bookingId}/options`, options);
    return response.data.booking;
  }

  async confirmQuote(bookingId: string): Promise<BookingDetail> {
    const response = await this.http.post<{ booking: BookingDetail }>(`booking/bookings/${bookingId}/confirm-quote`);
    return response.data.booking;
  }

  async checkRequirement(bookingId: string, type: RequirementType): Promise<BookingRequirement> {
    const response = await this.http.post<{ requirement: BookingRequirement }>(
      `booking/bookings/${bookingId}/requirements/${type}/check`,
    );
    return response.data.requirement;
  }

  async list(params?: BookingsListParams): Promise<BookingsList> {
    const query = buildQueryString(params);
    const path = query ? `booking/bookings?${query}` : 'booking/bookings';
    const response = await this.http.get<BookingsList>(path);
    return response.data;
  }

  async get(bookingId: string): Promise<BookingDetail> {
    const response = await this.http.get<{ booking: BookingDetail }>(`booking/bookings/${bookingId}`);
    return response.data.booking;
  }

  async getRequirements(bookingId: string): Promise<BookingRequirement[]> {
    const response = await this.http.get<{ requirements: BookingRequirement[] }>(
      `booking/bookings/${bookingId}/requirements`,
    );
    return response.data.requirements;
  }

  async cancel(bookingId: string, params: CancelBookingParams): Promise<BookingDetail> {
    const response = await this.http.post<{ booking: BookingDetail }>(
      `booking/bookings/${bookingId}/cancel`,
      params,
    );
    return response.data.booking;
  }

  async extend(bookingId: string, params: ExtendBookingParams): Promise<BookingDetail> {
    const response = await this.http.post<{ booking: BookingDetail }>(
      `booking/bookings/${bookingId}/extend`,
      params,
    );
    return response.data.booking;
  }

  async confirmExtension(bookingId: string): Promise<BookingDetail> {
    const response = await this.http.post<{ booking: BookingDetail }>(
      `booking/bookings/${bookingId}/confirm-extension`,
    );
    return response.data.booking;
  }

  async pay(bookingId: string, params?: PayBookingParams): Promise<PaymentLinkResult> {
    const response = await this.http.post<PaymentLinkResult>(
      `booking/bookings/${bookingId}/pay`,
      params ?? { scope: 'all' },
    );
    return response.data;
  }

  async renewPaymentLink(paymentLinkId: string): Promise<RenewPaymentLinkResult> {
    const response = await this.http.post<RenewPaymentLinkResult>(
      `payment/links/${paymentLinkId}/renew`,
    );
    return response.data;
  }
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
