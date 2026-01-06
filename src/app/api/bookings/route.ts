import { NextResponse } from 'next/server';

export async function GET() {
  // Mock bookings
  const bookings = [
    {
      id: 'b1',
      roomId: '1',
      userId: 'u1',
      checkIn: '2026-01-10',
      checkOut: '2026-01-15',
      guests: 2,
      totalPrice: 450,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
  ];
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newBooking = {
    ...body,
    id: `b${Math.random().toString(36).substr(2, 9)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  return NextResponse.json(newBooking, { status: 201 });
}