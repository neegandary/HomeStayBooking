export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkIn: string;     // ISO date
  checkOut: string;    // ISO date
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
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
}