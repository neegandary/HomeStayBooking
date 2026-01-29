import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '@/types/review';

/**
 * Review Model
 * Stores user reviews and ratings for rooms after completed bookings
 */
export interface IReviewModel extends IReview, Document {}

const ReviewSchema: Schema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
      minlength: 10,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ReviewSchema.index({ roomId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });

// Transform _id to id when converting to JSON
ReviewSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string })?.toString();
    if (ret.roomId) ret.roomId = (ret.roomId as { toString(): string }).toString();
    if (ret.userId) ret.userId = (ret.userId as { toString(): string }).toString();
    if (ret.bookingId) ret.bookingId = (ret.bookingId as { toString(): string }).toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Review || mongoose.model<IReviewModel>('Review', ReviewSchema);