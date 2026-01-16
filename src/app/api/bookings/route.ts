import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import Promotion from '@/models/Promotion';
import { sepay } from '@/lib/sepay';
import { withAuth, isAuthenticated } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// Helper function to calculate discount
function calculateDiscount(promo: { type: string; value: number; maxDiscount?: number }, orderValue: number): number {
  let discount: number;
  if (promo.type === 'percentage') {
    discount = Math.round(orderValue * (promo.value / 100));
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.value;
  }
  // Ensure discount doesn't exceed order value
  return Math.min(discount, orderValue);
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await withAuth(request);
    
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }

    await connectDB();
    
    // Users can only see their own bookings, admins can see all
    const filter = authResult.user.role === 'admin' 
      ? {} 
      : { userId: authResult.user.userId };
    
    const bookings = await Booking.find(filter)
      .populate('roomId')
      .populate('userId')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await withAuth(request);
    
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    await connectDB();

    // Check if roomId is a valid MongoDB ObjectId, if not generate a new one for mock data
    let roomId = body.roomId;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(roomId) &&
      (new mongoose.Types.ObjectId(roomId)).toString() === roomId;

    if (!isValidObjectId) {
      // For mock room ids like "1", "2", generate a deterministic ObjectId
      // This allows consistent mapping between mock rooms and bookings
      roomId = new mongoose.Types.ObjectId();
    }

    // Handle promo code if provided
    const originalPrice = body.totalPrice;
    let discountAmount = 0;
    let promoCode: string | undefined;

    if (body.promoCode) {
      const now = new Date();
      const promo = await Promotion.findOne({
        code: body.promoCode.toUpperCase(),
        active: true,
        validFrom: { $lte: now },
        validTo: { $gte: now },
      });

      if (promo) {
        // Validate usage limit
        if (promo.usageLimit === null || promo.usedCount < promo.usageLimit) {
          // Validate minimum order value
          if (body.totalPrice >= promo.minOrderValue) {
            discountAmount = calculateDiscount(promo, body.totalPrice);
            promoCode = promo.code;

            // Increment usage count atomically
            await Promotion.updateOne(
              { _id: promo._id },
              { $inc: { usedCount: 1 } }
            );
          }
        }
      }
    }

    const finalPrice = originalPrice - discountAmount;

    // Create booking with authenticated user's ID and contact info from form
    const newBooking = await Booking.create({
      ...body,
      roomId,
      userId: authResult.user.userId,
      guestName: body.guestName || authResult.user.name || authResult.user.email,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      specialRequests: body.specialRequests,
      totalPrice: finalPrice,
      originalPrice: discountAmount > 0 ? originalPrice : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      promoCode,
      status: 'pending',
    });

    const bookingJson = newBooking.toJSON();

    // Attach payment info for the frontend
    const paymentInfo = sepay.getPaymentInfo(bookingJson.id, bookingJson.totalPrice);

    return NextResponse.json({
      ...bookingJson,
      paymentInfo
    }, { status: 201 });
  } catch (error) {
    console.error('Create Booking Error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
