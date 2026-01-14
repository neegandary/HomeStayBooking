import { PaymentInfo } from './payment';
export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  guestName?: string;
  checkIn: string;     // ISO date
  checkOut: string;    // ISO date
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  checkedInAt?: string;
  createdAt: string;
  paymentInfo?: PaymentInfo;
}

export interface BookingFormData {
  roomId: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  totalPrice?: number;
  promoCode?: string;
}