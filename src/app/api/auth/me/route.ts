import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (authHeader?.startsWith('Bearer mock-access-token')) {
    return NextResponse.json({
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}