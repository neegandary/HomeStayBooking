import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (refreshToken === 'mock-refresh-token') {
      return NextResponse.json({
        accessToken: 'mock-access-token-new-' + Date.now(),
      });
    }

    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}