import fs from 'fs';
import path from 'path';
import { Booking } from '@/types/booking';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Initial mock data
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: '1',
    userId: 'u1',
    checkIn: '2026-01-10',
    checkOut: '2026-01-15',
    guests: 2,
    totalPrice: 7500000,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b2',
    roomId: '2',
    userId: 'u2',
    checkIn: '2026-01-12',
    checkOut: '2026-01-14',
    guests: 1,
    totalPrice: 5000000,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export const storage = {
  init: () => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(INITIAL_BOOKINGS, null, 2));
    }
  },

  getBookings: (): Booking[] => {
    storage.init();
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  },

  saveBooking: (booking: Booking) => {
    const bookings = storage.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      bookings[index] = booking;
    } else {
      bookings.push(booking);
    }
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  },

  updateBookingStatus: (id: string, status: Booking['status']) => {
    const bookings = storage.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = status;
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
      return bookings[index];
    }
    return null;
  }
};
