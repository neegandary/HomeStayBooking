import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';

export async function GET() {
  try {
    await connectDB();
    const rooms = await Room.find({});
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Fetch Rooms Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
