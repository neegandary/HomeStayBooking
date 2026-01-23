import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { checkinSchema, getFirstErrorMessage } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validation = checkinSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = getFirstErrorMessage(validation.error.flatten());
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }
    
    const { bookingId, roomId } = validation.data;

    await connectDB();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Verify room matches if provided
    if (roomId && booking.roomId.toString() !== roomId) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Room does not match this booking' 
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        valid: false, 
        error: `Booking status is ${booking.status}, not confirmed` 
      });
    }

    // Check dates
    const today = new Date().toISOString().split('T')[0];
    const checkInDate = booking.checkIn;
    const checkOutDate = booking.checkOut;

    if (today < checkInDate) {
      return NextResponse.json({ 
        valid: false, 
        error: `Check-in date is ${checkInDate}. Too early to check in.` 
      });
    }

    if (today > checkOutDate) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This booking has expired' 
      });
    }

    // Update booking status to checked-in
    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    return NextResponse.json({
      valid: true,
      message: 'Check-in successful!',
      booking: {
        id: booking._id,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        specialRequests: booking.specialRequests,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        roomId: booking.roomId,
        status: booking.status,
      }
    });
  } catch (error) {
    console.error('Check-in Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
