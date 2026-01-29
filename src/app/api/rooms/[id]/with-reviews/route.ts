import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import Review from '@/models/Review';
import mongoose from 'mongoose';

/**
 * GET /api/rooms/[id]/with-reviews
 * Get room details with rating statistics and recent reviews
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    const room = await Room.findOne({
      _id: new mongoose.Types.ObjectId(id),
      deleted: { $ne: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { roomId: room._id, deleted: { $ne: true } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distributionObj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      if (d._1 >= 1 && d._1 <= 5) {
        distributionObj[d._1 as keyof typeof distributionObj] = d.count;
      }
    });

    // Get recent reviews
    const recentReviews = await Review.find({
      roomId: room._id,
      deleted: { $ne: true },
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const ratingStats = {
      averageRating: room.averageRating || 0,
      totalReviews: room.reviewCount || 0,
      distribution: distributionObj,
    };

    return NextResponse.json({
      room,
      ratingStats,
      recentReviews,
    });
  } catch (error) {
    console.error('Get Room with Reviews Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}