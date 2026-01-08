import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { sepay } from '@/lib/sepay';
import { withAuth, isAuthenticated } from '@/lib/auth';
import mongoose from 'mongoose';

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

    // Create booking with authenticated user's ID and name
    const newBooking = await Booking.create({
      ...body,
      roomId,
      userId: authResult.user.userId,
      guestName: authResult.user.name || authResult.user.email,
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
