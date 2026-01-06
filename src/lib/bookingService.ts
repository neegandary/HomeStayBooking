import api from './axios';
import { Booking, BookingFormData } from '@/types/booking';

export const bookingService = {
  create: (data: BookingFormData) => api.post<Booking>('/bookings', data),
  getAll: () => api.get<Booking[]>('/bookings'),
  getById: (id: string) => api.get<Booking>(`/bookings/${id}`),
  cancel: (id: string) => api.patch<Booking>(`/bookings/${id}`, { status: 'cancelled' }),
  getAvailability: (roomId: string) => api.get<{ bookedDates: string[] }>(`/rooms/${roomId}/availability`),
};