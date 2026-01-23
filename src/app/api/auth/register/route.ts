import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/lib/auth';
import { rateLimiters, getClientIP } from '@/lib/ratelimit';
import { registerSchema, getFirstErrorMessage } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 accounts per hour per IP
    const ip = getClientIP(request);
    const rateLimit = rateLimiters.register(ip);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) }
        }
      );
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = getFirstErrorMessage(validation.error.flatten());
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validation.data;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: 'user',
    });

    // Generate real JWT tokens
    const { accessToken, refreshToken } = await generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
