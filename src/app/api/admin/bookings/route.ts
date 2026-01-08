import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { withAdminAuth, isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    await connectDB();

    // Build query
    const query: Record<string, string> = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Note: Search on populated fields in MongoDB is complex.
    // For now, we fetch all and filter in memory or search on base fields.
    const bookings = await Booking.find(query)
      .populate('roomId')
      .populate('userId');

    interface PopulatedRoom { name?: string }
    interface PopulatedUser { name?: string; email?: string }

    let result = bookings.map(b => {
      const booking = b.toJSON();
      const room = b.roomId as unknown as PopulatedRoom;
      const user = b.userId as unknown as PopulatedUser;
      return {
        ...booking,
        roomName: room?.name || 'Unknown Room',
        guestName: user?.name || 'Guest',
        guestEmail: user?.email || 'Email',
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchLower) ||
          b.guestEmail.toLowerCase().includes(searchLower) ||
          b.roomName.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
