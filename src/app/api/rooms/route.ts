import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Build filter query
    const filters: Record<string, unknown> = { available: true };

    // Price filter with validation
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.price = {};
      const minPriceNum = minPrice ? Number(minPrice) : null;
      const maxPriceNum = maxPrice ? Number(maxPrice) : null;

      if (minPriceNum !== null && !isNaN(minPriceNum) && minPriceNum >= 0) {
        (filters.price as Record<string, number>).$gte = minPriceNum;
      }
      if (maxPriceNum !== null && !isNaN(maxPriceNum) && maxPriceNum >= 0) {
        (filters.price as Record<string, number>).$lte = maxPriceNum;
      }

      // Remove empty price filter
      if (Object.keys(filters.price as object).length === 0) {
        delete filters.price;
      }
    }

    // Amenities filter - support both comma-separated and multiple params
    const amenitiesParam = searchParams.get('amenities');
    const amenitiesAll = searchParams.getAll('amenities');
    let amenities: string[] = [];
    if (amenitiesParam) {
      amenities = amenitiesParam.split(',').map(a => a.trim()).filter(Boolean);
    } else if (amenitiesAll.length > 0) {
      amenities = amenitiesAll;
    }
    if (amenities.length > 0) {
      // Sanitize: whitelist alphanumeric, spaces, hyphens only (max 50 chars)
      // Escape regex special chars to prevent ReDoS/injection
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sanitizedAmenities = amenities
        .filter(a => /^[a-zA-Z0-9\s-]{1,50}$/.test(a))
        .map(a => escapeRegex(a));

      if (sanitizedAmenities.length > 0) {
        // Case-insensitive exact match
        filters.amenities = {
          $all: sanitizedAmenities.map(a => new RegExp(`^${a}$`, 'i'))
        };
      }
    }

    // Capacity filter with validation (guests param for backward compat)
    const capacity = searchParams.get('capacity') || searchParams.get('guests');
    if (capacity) {
      const capacityNum = Number(capacity);
      if (!isNaN(capacityNum) && capacityNum > 0) {
        filters.capacity = { $gte: capacityNum };
      }
    }

    // Availability filter - exclude rooms with conflicting bookings
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (checkIn && checkOut) {
      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkInDate < checkOutDate) {
        // Find rooms that have overlapping bookings
        const bookedRoomIds = await Booking.distinct('roomId', {
          status: { $nin: ['cancelled', 'completed'] },
          $or: [
            // Booking starts during requested period
            { checkIn: { $gte: checkIn, $lt: checkOut } },
            // Booking ends during requested period
            { checkOut: { $gt: checkIn, $lte: checkOut } },
            // Booking spans entire requested period
            { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
          ]
        });

        if (bookedRoomIds.length > 0) {
          filters._id = { $nin: bookedRoomIds.map((id: mongoose.Types.ObjectId) => id) };
        }
      }
    }

    // Pagination (default 12 rooms/page as per validation)
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 12));
    const skip = (page - 1) * limit;

    // Execute query
    const [rooms, total] = await Promise.all([
      Room.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Room.countDocuments(filters)
    ]);

    return NextResponse.json({
      rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Fetch Rooms Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
