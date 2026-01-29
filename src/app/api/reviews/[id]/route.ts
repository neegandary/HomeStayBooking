import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Review from '@/models/Review';
import Room from '@/models/Room';
import { withAdminAuth, isAuthenticated } from '@/lib/auth/middleware';
import mongoose from 'mongoose';

/**
 * DELETE /api/reviews/[id]
 * Soft delete a review (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await withAdminAuth(request);

    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }

    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.deleted) {
      return NextResponse.json({ error: 'Review already deleted' }, { status: 400 });
    }

    // Soft delete with session for atomic rating update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Soft delete the review
      review.deleted = true;
      await review.save({ session });

      // Recalculate room rating
      const reviews = await Review.find({
        roomId: review.roomId,
        deleted: { $ne: true },
      }).session(session);

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      await Room.findByIdAndUpdate(review.roomId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      }).session(session);

      await session.commitTransaction();

      return NextResponse.json({ message: 'Review deleted successfully' });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Delete Review Error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}