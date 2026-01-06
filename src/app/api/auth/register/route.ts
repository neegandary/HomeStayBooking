import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Mock registration
    return NextResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: Date.now().toString(), email, name }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}