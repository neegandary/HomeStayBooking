import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { sepay } from '@/lib/sepay';
import { SePayWebhookPayload } from '@/types/payment';

export async function POST(request: Request) {
  try {
    const payload: SePayWebhookPayload = await request.json();

    // 1. Parse booking ID from content
    const bookingId = sepay.parseBookingId(payload.content);

    if (!bookingId) {
      console.log('Webhook: No booking ID found in content:', payload.content);
      return NextResponse.json({ success: true, message: 'No booking ID found' });
    }

    // 2. Connect to DB and find booking
    await connectDB();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.log('Webhook: Booking not found:', bookingId);
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // 3. Verify amount
    if (payload.transferAmount < booking.totalPrice) {
      console.log('Webhook: Insufficient amount:', payload.transferAmount, '<', booking.totalPrice);
      return NextResponse.json({ success: false, message: 'Insufficient amount' });
    }

    // 4. Update status
    booking.status = 'confirmed';
    await booking.save();

    console.log('Webhook: Booking confirmed successfully:', bookingId);

    return NextResponse.json({ success: true, message: 'Booking confirmed' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
