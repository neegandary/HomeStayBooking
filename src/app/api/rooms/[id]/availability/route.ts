import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Check if id is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && 
      (new mongoose.Types.ObjectId(id)).toString() === id;

    // If not a valid ObjectId (e.g., mock room ids like "1", "2"), return empty array
    if (!isValidObjectId) {
      return NextResponse.json({ bookedDates: [] });
    }

    const bookedDates = await Booking.find({
      roomId: new mongoose.Types.ObjectId(id),
      status: { $ne: 'cancelled' }
    }).select('checkIn checkOut');

    // Simple implementation: just return an array of dates between checkIn and checkOut
    const dates: string[] = [];
    bookedDates.forEach(booking => {
      const current = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    return NextResponse.json({ bookedDates: Array.from(new Set(dates)) });
  } catch (error) {
    console.error('Fetch Availability Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
