import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import { withAdminAuth, isAuthenticated } from '@/lib/auth/middleware';

interface DailyRevenue {
  _id: number;
  revenue: number;
}

export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request);
  if (!isAuthenticated(authResult)) return authResult.error;

  try {
    await connectDB();

    // Get total revenue from confirmed/completed/checked-in bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed', 'checked-in'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get booking counts by status
    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const bookingCounts = bookingStats.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const activeBookings = (bookingCounts['confirmed'] || 0) + (bookingCounts['checked-in'] || 0);
    const totalBookings = Object.values(bookingCounts).reduce<number>((a, b) => a + (b as number), 0);

    // Get total rooms
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ available: true });

    // Calculate occupancy rate (rooms currently occupied / total rooms)
    const today = new Date().toISOString().split('T')[0];
    const occupiedRoomsToday = await Booking.distinct('roomId', {
      status: { $in: ['confirmed', 'checked-in'] },
      checkIn: { $lte: today },
      checkOut: { $gte: today }
    });
    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRoomsToday.length / totalRooms) * 100)
      : 0;

    // Get weekly revenue for chart
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyRevenueData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed', 'checked-in'] },
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Map to weekday names (MongoDB: 1=Sun, 2=Mon, ..., 7=Sat)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyRevenue = dayNames.map((day, index) => {
      const dayData = weeklyRevenueData.find((d: DailyRevenue) => d._id === index + 1);
      return {
        day,
        value: dayData ? Math.round(dayData.revenue / 1000000) : 0 // Convert to millions
      };
    });

    // Get recent bookings for activity feed
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('roomId', 'name')
      .lean();

    const recentActivity = recentBookings.map((booking, index) => ({
      id: index + 1,
      user: booking.guestName || 'Guest',
      action: booking.status === 'cancelled' ? 'cancelled' : 'booked',
      target: (booking.roomId as { name?: string })?.name || 'Room',
      time: getRelativeTime(new Date(booking.createdAt)),
      amount: booking.status !== 'cancelled' ? formatCurrency(booking.totalPrice) : '0đ'
    }));

    return NextResponse.json({
      stats: {
        totalRevenue,
        activeBookings,
        totalBookings,
        totalRooms,
        availableRooms,
        occupancyRate
      },
      weeklyRevenue,
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('vi-VN');
}
