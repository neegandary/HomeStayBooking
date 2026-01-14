import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Promotion from '@/models/Promotion';
import { withAuth, isAuthenticated } from '@/lib/auth';

// GET single promotion (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Get Promotion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update promotion (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    // Check if promotion exists
    const existing = await Promotion.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const duplicate = await Promotion.findOne({ code: body.code.toUpperCase() });
      if (duplicate) {
        return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
      }
    }

    // Validate dates if provided
    if (body.validFrom && body.validTo) {
      const validFrom = new Date(body.validFrom);
      const validTo = new Date(body.validTo);
      if (validTo <= validFrom) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.code) updateData.code = body.code.toUpperCase();
    if (body.name) updateData.name = body.name;
    if (body.type) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.minOrderValue !== undefined) updateData.minOrderValue = body.minOrderValue;
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount;
    if (body.validFrom) updateData.validFrom = new Date(body.validFrom);
    if (body.validTo) updateData.validTo = new Date(body.validTo);
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit;
    if (body.active !== undefined) updateData.active = body.active;

    const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Update Promotion Error:', error);
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE promotion (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (!isAuthenticated(authResult)) {
      return authResult.error;
    }
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete Promotion Error:', error);
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
