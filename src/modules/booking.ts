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
  CancellationResult,
  BookingExtension,
  RequirementType,
} from '../types/booking';

export class BookingModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async create(params: CreateBookingParams): Promise<Booking> {
    const response = await this.http.post<Booking>('booking/bookings', params);
    return response.data;
  }

  async quote(bookingId: string): Promise<Booking> {
    const response = await this.http.post<Booking>(`booking/bookings/${bookingId}/quote`);
    return response.data;
  }

  async updateOptions(bookingId: string, options: UpdateBookingOptionsParams): Promise<Booking> {
    const response = await this.http.put<Booking>(`booking/bookings/${bookingId}/options`, options);
    return response.data;
  }

  async confirmQuote(bookingId: string): Promise<Booking> {
    const response = await this.http.post<Booking>(`booking/bookings/${bookingId}/confirm-quote`);
    return response.data;
  }

  async checkRequirement(bookingId: string, type: RequirementType): Promise<BookingRequirement> {
    const response = await this.http.post<BookingRequirement>(
      `booking/bookings/${bookingId}/requirements/${type}/check`,
    );
    return response.data;
  }

  async list(params?: BookingsListParams): Promise<BookingsList> {
    const query = buildQueryString(params);
    const path = query ? `booking/bookings?${query}` : 'booking/bookings';
    const response = await this.http.get<BookingsList>(path);
    return response.data;
  }

  async get(bookingId: string): Promise<BookingDetail> {
    const response = await this.http.get<BookingDetail>(`booking/bookings/${bookingId}`);
    return response.data;
  }

  async getRequirements(bookingId: string): Promise<BookingRequirement[]> {
    const response = await this.http.get<BookingRequirement[]>(
      `booking/bookings/${bookingId}/requirements`,
    );
    return response.data;
  }

  async cancel(bookingId: string, params: CancelBookingParams): Promise<CancellationResult> {
    const response = await this.http.post<CancellationResult>(
      `booking/bookings/${bookingId}/cancel`,
      params,
    );
    return response.data;
  }

  async extend(bookingId: string, params: ExtendBookingParams): Promise<BookingExtension> {
    const response = await this.http.post<BookingExtension>(
      `booking/bookings/${bookingId}/extend`,
      params,
    );
    return response.data;
  }

  async confirmExtension(bookingId: string): Promise<Booking> {
    const response = await this.http.post<Booking>(
      `booking/bookings/${bookingId}/confirm-extension`,
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
