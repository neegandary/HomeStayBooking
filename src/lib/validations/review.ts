import { z } from 'zod';

export const createReviewSchema = z.object({
  roomId: z.string()
    .min(1, 'Room ID is required'),
  bookingId: z.string()
    .min(1, 'Booking ID is required'),
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be less than 2000 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;