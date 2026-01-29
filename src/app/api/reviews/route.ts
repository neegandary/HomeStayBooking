import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Review from '@/models/Review';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import { withAuth, isAuthenticated } from '@/lib/auth/middleware';
import { createReviewSchema } from '@/lib/validations/review';
import mongoose from 'mongoose';

/**
 * GET /api/reviews
 * List reviews by roomId with pagination
 * Public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10));
    const skip = (page - 1) * limit;

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json(
        { error: 'Valid roomId is required' },
        { status: 400 }
      );
    }

    // Filter out soft-deleted reviews
    const filter = {
      roomId: new mongoose.Types.ObjectId(roomId),
      deleted: { $ne: true },
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(filter),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a new review
 * Auth required, verified booking only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await withAuth(request);

    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }

    await connectDB();

    const body = await request.json();

    // Validate input with Zod
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { roomId, bookingId, rating, comment } = validation.data;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid bookingId' }, { status: 400 });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: new mongoose.Types.ObjectId(bookingId),
      userId: new mongoose.Types.ObjectId(authResult.user.userId),
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'You can only review after your stay is completed' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 409 }
      );
    }

    // Create review with session for atomic rating update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create review
      const review = await Review.create([{
        roomId: new mongoose.Types.ObjectId(roomId),
        userId: new mongoose.Types.ObjectId(authResult.user.userId),
        bookingId: new mongoose.Types.ObjectId(bookingId),
        rating,
        comment,
        isVerified: true,
      }], { session });

      // Update room rating aggregation
      const reviews = await Review.find({
        roomId: new mongoose.Types.ObjectId(roomId),
        deleted: { $ne: true },
      }).session(session);

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      await Room.findByIdAndUpdate(roomId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      }).session(session);

      await session.commitTransaction();

      const reviewJson = review[0].toJSON();

      return NextResponse.json(reviewJson, { status: 201 });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Create Review Error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}