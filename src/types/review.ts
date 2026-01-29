import mongoose from 'mongoose';

/**
 * Review interface for the Review model
 * Represents a user's review of a room after completed booking
 */
export interface IReview {
  _id: mongoose.Types.ObjectId;
  /** Reference to the room being reviewed */
  roomId: mongoose.Types.ObjectId;
  /** Reference to the user who wrote the review */
  userId: mongoose.Types.ObjectId;
  /** Reference to the booking this review is associated with */
  bookingId: mongoose.Types.ObjectId;
  /** Rating from 1-5 stars */
  rating: number;
  /** Review comment text (max 2000 characters) */
  comment: string;
  /** Whether the booking was completed (verified stay) */
  isVerified: boolean;
  /** Soft delete flag for moderation */
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Type for Review document from Mongoose */
export type ReviewDocument = IReview & mongoose.Document;

/** Zod schema for creating a review */
export const createReviewSchema = {
  roomId: (val: unknown) => typeof val === 'string' && mongoose.Types.ObjectId.isValid(val),
  bookingId: (val: unknown) => typeof val === 'string' && mongoose.Types.ObjectId.isValid(val),
  rating: (val: unknown) => typeof val === 'number' && val >= 1 && val <= 5,
  comment: (val: unknown) => typeof val === 'string' && val.length <= 2000 && val.length >= 10,
};

/** Response type for review list API */
export interface ReviewListResponse {
  reviews: ReviewPopulated[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Review with populated user data */
export interface ReviewPopulated {
  id: string;
  userId: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

/** Rating statistics for a room */
export interface RoomRatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}