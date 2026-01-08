import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { sepay } from '@/lib/sepay';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingJson = booking.toJSON();
    
    // Attach payment info for the frontend (fixed 5000 VND for testing)
    const paymentInfo = sepay.getPaymentInfo(bookingJson.id, 5000);

    return NextResponse.json({
      ...bookingJson,
      paymentInfo
    });
  } catch (error) {
    console.error('Get Booking by ID Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBooking);
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
