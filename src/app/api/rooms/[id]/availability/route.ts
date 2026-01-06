import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = await params;
  return NextResponse.json({
    bookedDates: ['2026-01-20', '2026-01-21', '2026-01-25']
  });
}