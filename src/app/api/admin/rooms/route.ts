import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import { withAdminAuth, isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    await connectDB();
    const rooms = await Room.find({});
    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    await connectDB();
    const newRoom = await Room.create({
      ...body,
      available: true,
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
