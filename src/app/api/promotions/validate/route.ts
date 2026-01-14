import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Promotion from '@/models/Promotion';

// POST validate promo code (public - for booking flow)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderValue } = body;

    if (!code || orderValue === undefined) {
      return NextResponse.json({ valid: false, error: 'Missing code or order value' }, { status: 400 });
    }

    // Validate code format
    if (!/^[A-Z0-9]{3,20}$/i.test(code)) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code format' });
    }

    await connectDB();

    const now = new Date();
    const promo = await Promotion.findOne({
      code: code.toUpperCase(),
      active: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' });
    }

    // Check usage limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Promo code usage limit reached' });
    }

    // Check minimum order value
    if (orderValue < promo.minOrderValue) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order value: ${promo.minOrderValue.toLocaleString('vi-VN')}đ`
      });
    }

    // Calculate discount
    let discount: number;
    if (promo.type === 'percentage') {
      discount = Math.round(orderValue * (promo.value / 100));
      // Apply max discount cap if set
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.value;
    }

    // Ensure discount doesn't exceed order value
    if (discount > orderValue) {
      discount = orderValue;
    }

    return NextResponse.json({
      valid: true,
      discount,
      promoId: promo.id,
      promoName: promo.name,
      promoType: promo.type,
      promoValue: promo.value,
    });
  } catch (error) {
    console.error('Validate Promo Error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate promo code' }, { status: 500 });
  }
}
