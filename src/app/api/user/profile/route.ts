import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { withAuth, isAuthenticated } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (!isAuthenticated(authResult)) return authResult.error;

  try {
    await connectDB();
    const user = await User.findById(authResult.user.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.toJSON());
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request);
  if (!isAuthenticated(authResult)) return authResult.error;

  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name && !email) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Basic validation
    if (name && (name.length < 2 || name.length > 100)) {
      return NextResponse.json({ error: 'Name must be 2-100 characters' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await connectDB();

    // Check email uniqueness if changing email
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: authResult.user.userId }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const updateData: { name?: string; email?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      authResult.user.userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
