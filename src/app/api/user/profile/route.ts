import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    id: '1',
    ...body,
  });
}