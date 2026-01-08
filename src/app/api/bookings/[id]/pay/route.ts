import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import vnpay from '@/lib/vnpay';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectDB();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'confirmed') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // Create VNPay payment URL (fixed 10000 VND for testing - VNPay minimum)
    const paymentUrl = vnpay.createPaymentUrl({
      bookingId: id,
      amount: 10000, // Fixed 10,000 VND for testing (VNPay minimum)
      orderInfo: `Thanh toan dat phong ${booking.roomId}`,
      ipAddr: ip,
    });

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('Create Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
