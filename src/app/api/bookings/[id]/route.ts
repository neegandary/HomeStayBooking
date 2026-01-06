import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    roomId: '1',
    userId: 'u1',
    checkIn: '2026-01-10',
    checkOut: '2026-01-15',
    guests: 2,
    totalPrice: 450,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return NextResponse.json({ id, ...body });
}