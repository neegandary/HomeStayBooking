import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createBookingSchema = z.object({
  roomId: z.string()
    .min(1, 'Room ID is required'),
  checkIn: z.string()
    .min(1, 'Check-in date is required')
    .regex(dateRegex, 'Check-in must be in YYYY-MM-DD format'),
  checkOut: z.string()
    .min(1, 'Check-out date is required')
    .regex(dateRegex, 'Check-out must be in YYYY-MM-DD format'),
  guests: z.number()
    .int('Guests must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(10, 'Maximum 10 guests allowed'),
  guestName: z.string()
    .min(1, 'Guest name is required')
    .min(2, 'Guest name must be at least 2 characters')
    .max(100, 'Guest name must be less than 100 characters'),
  guestEmail: z.string()
    .min(1, 'Guest email is required')
    .email('Invalid email format'),
  guestPhone: z.string()
    .min(1, 'Guest phone is required')
    .min(10, 'Phone must be at least 10 digits'),
  specialRequests: z.string()
    .max(500, 'Special requests must be less than 500 characters')
    .optional(),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

export const checkinSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
