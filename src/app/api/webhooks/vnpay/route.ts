import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import vnpay from '@/lib/vnpay';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const vnpParams: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      vnpParams[key] = value;
    });

    console.log('VNPay Return:', vnpParams);

    // Verify signature
    const isValid = vnpay.verifyReturnUrl(vnpParams);
    if (!isValid) {
      console.log('VNPay: Invalid signature');
      return NextResponse.redirect(new URL('/payment/failed?error=invalid_signature', request.url));
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const bookingId = vnpay.parseBookingId(txnRef);

    if (!bookingId) {
      console.log('VNPay: No booking ID found');
      return NextResponse.redirect(new URL('/payment/failed?error=no_booking', request.url));
    }

    // Connect to DB
    await connectDB();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.log('VNPay: Booking not found:', bookingId);
      return NextResponse.redirect(new URL('/payment/failed?error=booking_not_found', request.url));
    }

    if (vnpay.isSuccessful(responseCode)) {
      // Payment successful - update booking status
      booking.status = 'confirmed';
      booking.paymentInfo = {
        transactionId: vnpParams['vnp_TransactionNo'],
        bankCode: vnpParams['vnp_BankCode'],
        payDate: vnpParams['vnp_PayDate'],
        amount: parseInt(vnpParams['vnp_Amount']) / 100,
      };
      await booking.save();

      console.log('VNPay: Booking confirmed:', bookingId);
      
      // Redirect to booking confirmation page
      return NextResponse.redirect(new URL(`/booking/${bookingId}`, request.url));
    } else {
      // Payment failed
      console.log('VNPay: Payment failed with code:', responseCode);
      return NextResponse.redirect(new URL(`/payment/${bookingId}?error=payment_failed&code=${responseCode}`, request.url));
    }
  } catch (error) {
    console.error('VNPay Webhook Error:', error);
    return NextResponse.redirect(new URL('/payment/failed?error=server_error', request.url));
  }
}
