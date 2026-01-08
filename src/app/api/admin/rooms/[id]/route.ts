import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import { withAdminAuth, isAuthenticated } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    await connectDB();
    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();
    const updatedRoom = await Room.findByIdAndUpdate(id, body, { new: true });

    if (!updatedRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRoom);
  } catch {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await withAdminAuth(request);
  
  if (!isAuthenticated(authResult)) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    await connectDB();
    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
