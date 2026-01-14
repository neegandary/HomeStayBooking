import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Promotion from '@/models/Promotion';
import { withAuth, isAuthenticated } from '@/lib/auth';

// GET all promotions (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Get Promotions Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create new promotion (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.code || !body.name || !body.type || body.value === undefined || !body.validFrom || !body.validTo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate promo code format (alphanumeric only)
    if (!/^[A-Z0-9]{3,20}$/i.test(body.code)) {
      return NextResponse.json({ error: 'Invalid promo code format (3-20 alphanumeric characters)' }, { status: 400 });
    }

    // Validate type
    if (!['percentage', 'fixed'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
    }

    // Validate value
    if (body.type === 'percentage' && (body.value < 0 || body.value > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }
    if (body.type === 'fixed' && body.value < 0) {
      return NextResponse.json({ error: 'Fixed amount must be positive' }, { status: 400 });
    }

    // Validate dates
    const validFrom = new Date(body.validFrom);
    const validTo = new Date(body.validTo);
    if (validTo <= validFrom) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    await connectDB();

    // Check for duplicate code
    const existing = await Promotion.findOne({ code: body.code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }

    const promotion = await Promotion.create({
      code: body.code.toUpperCase(),
      name: body.name,
      type: body.type,
      value: body.value,
      minOrderValue: body.minOrderValue || 0,
      maxDiscount: body.maxDiscount,
      validFrom,
      validTo,
      usageLimit: body.usageLimit || null,
      active: body.active !== false,
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Create Promotion Error:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
