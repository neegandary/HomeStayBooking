import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { withAuth, isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = await withAuth(request);
    
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }

    await connectDB();

    // Find user by ID from token payload
    const user = await User.findById(authResult.user.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
