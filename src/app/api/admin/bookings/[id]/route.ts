import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { withAdminAuth, isAuthenticated } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    await connectDB();
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate('roomId').populate('userId');

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Update Booking Error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
