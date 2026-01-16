'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
import { Room } from '@/types/room';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        bookingService.getAll(),
        fetch('/api/rooms?limit=100').then(res => res.json())
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.rooms || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) return;

    try {
      await bookingService.cancel(id);
      await fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Không thể hủy đặt phòng. Vui lòng thử lại.');
    }
  };

  // Separate bookings into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const checkInDate = new Date(b.checkIn);
    return checkInDate >= today && b.status !== 'cancelled' && b.status !== 'completed';
  });

  const pastBookings = bookings.filter(b => {
    const checkOutDate = new Date(b.checkOut);
    return checkOutDate < today || b.status === 'completed' || b.status === 'cancelled';
  });

  // Format date for display
  const formatDateRange = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' };
    return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}, ${end.toLocaleDateString('vi-VN', yearOptions)}`;
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'checked-in':
        return 'bg-secondary/20 text-secondary';
      case 'pending':
        return 'bg-amber-500/20 text-amber-600';
      case 'completed':
        return 'bg-primary/10 text-primary/60';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-primary/10 text-primary/60';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
        <main className="px-4 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-10">
          <div className="flex flex-col max-w-7xl w-full flex-1">
            <div className="animate-pulse space-y-8">
              <div className="h-10 w-48 bg-primary/10 rounded-lg"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="h-6 w-40 bg-primary/10 rounded"></div>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 bg-primary/5 rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="h-6 w-32 bg-primary/10 rounded"></div>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 bg-primary/5 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Booking Card Component
  const BookingCardItem = ({ booking, showCancel = false }: { booking: Booking; showCancel?: boolean }) => {
    const room = rooms.find(r => r._id === booking.roomId || r.id === booking.roomId);
    const canCancel = showCancel && booking.status !== 'cancelled' && booking.status !== 'completed';

    return (
      <div className="flex items-stretch justify-between gap-6 rounded-lg bg-white p-6 shadow-lg shadow-primary/5 border border-primary/5">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold leading-tight">{room?.name || `Booking #${booking.id.slice(-8)}`}</p>
            <p className="text-sm font-normal opacity-60">StayEasy</p>
            <p className="text-sm font-normal opacity-40">{formatDateRange(booking.checkIn, booking.checkOut)}</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
              {booking.status}
            </span>
            <div className="flex items-center gap-4">
              {booking.status === 'pending' && (
                <Link
                  href={`/payment/${booking.id}`}
                  className="text-amber-600 text-sm font-bold leading-normal hover:underline"
                >
                  Thanh toán
                </Link>
              )}
              <Link
                href={`/booking/${booking.id}`}
                className="text-secondary text-sm font-bold leading-normal hover:underline"
              >
                Xem chi tiết
              </Link>
              {canCancel && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="text-red-500 text-sm font-bold leading-normal hover:underline"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
        {room?.images?.[0] && (
          <div className="hidden sm:block w-40 h-auto bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 relative overflow-hidden">
            <Image
              src={room.images[0]}
              alt={room.name}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg bg-white border border-dashed border-primary/10">
      <span className="material-symbols-outlined text-4xl opacity-20 mb-4">calendar_month</span>
      <p className="text-sm opacity-50 text-center">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <main className="px-4 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-10">
        <div className="flex flex-col max-w-7xl w-full flex-1">
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4 mb-6">
            <h1 className="text-4xl font-black leading-tight tracking-tight min-w-72">Đặt phòng của tôi</h1>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Upcoming Bookings */}
            <section className="flex flex-col gap-6">
              <h2 className="text-[22px] font-bold leading-tight tracking-tight px-4">Đặt phòng sắp tới</h2>
              <div className="flex flex-col gap-6">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <BookingCardItem key={booking.id} booking={booking} showCancel={true} />
                  ))
                ) : (
                  <EmptyState message="Không có đặt phòng sắp tới. Hãy lên kế hoạch cho kỳ nghỉ tiếp theo!" />
                )}
              </div>
            </section>

            {/* Past Bookings */}
            <section className="flex flex-col gap-6">
              <h2 className="text-[22px] font-bold leading-tight tracking-tight px-4">Đặt phòng trước đây</h2>
              <div className="flex flex-col gap-6">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <BookingCardItem key={booking.id} booking={booking} showCancel={false} />
                  ))
                ) : (
                  <EmptyState message="Chưa có đặt phòng trước đây." />
                )}
              </div>
            </section>
          </div>

          {/* Explore CTA */}
          {bookings.length === 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/rooms"
                className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-secondary text-white text-sm font-bold tracking-wide hover:bg-secondary/90 transition-colors"
              >
                Khám phá phòng
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
