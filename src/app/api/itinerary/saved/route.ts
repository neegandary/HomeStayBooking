import { NextRequest, NextResponse } from 'next/server';
import { withAuth, isAuthenticated } from '@/lib/auth/middleware';
import connectDB from '@/lib/db/mongodb';
import Itinerary from '@/models/Itinerary';

/**
 * Saved Itinerary API Routes
 *
 * GET /api/itinerary/saved - Get user's saved itineraries
 * POST /api/itinerary/saved - Save a new itinerary
 */

/**
 * GET - Fetch user's saved itineraries
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (!isAuthenticated(authResult)) {
    return (authResult as { error: NextResponse }).error;
  }

  try {
    await connectDB();

    const itineraries = await Itinerary.find({ userId: authResult.user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      itineraries: itineraries.map(it => ({
        ...it,
        id: it._id?.toString(),
        _id: undefined,
        __v: undefined,
      }))
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    return NextResponse.json(
      { error: 'Không thể tải lịch trình.' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save a new itinerary
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (!isAuthenticated(authResult)) {
    return (authResult as { error: NextResponse }).error;
  }

  try {
    const body = await request.json();
    const { guestName, stayDuration, vibe, location, itinerary } = body;

    // Validate required fields
    if (!guestName || !stayDuration || !vibe || !itinerary) {
      return NextResponse.json(
        { error: 'Thiếu thông tin lịch trình' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new itinerary document
    const saved = await Itinerary.create({
      userId: authResult.user.userId,
      guestName,
      stayDuration,
      vibe,
      location: location || 'Đà Lạt',
      intro: itinerary.intro,
      days: itinerary.days,
      outro: itinerary.outro,
    });

    return NextResponse.json({
      message: 'Đã lưu lịch trình',
      itinerary: saved.toJSON()
    }, { status: 201 });
  } catch (error) {
    console.error('Save itinerary error:', error);
    return NextResponse.json(
      { error: 'Không thể lưu lịch trình.' },
      { status: 500 }
    );
  }
}
