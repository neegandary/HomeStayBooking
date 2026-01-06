'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
import { mockRooms } from '@/constants/mockRooms';
import BookingCard from '@/components/features/BookingCard';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed'>('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getAll();
      setBookings(response.data);
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancel(id);
      await fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
            My Bookings
          </h1>
          <p className="text-primary/50 font-medium mt-1">
            Manage your upcoming and past homestay experiences.
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-primary/5 shadow-sm w-fit overflow-x-auto">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-primary text-white shadow-xl shadow-primary/20'
                  : 'text-primary/40 hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => {
            const room = mockRooms.find(r => r.id === booking.roomId);
            return (
              <BookingCard
                key={booking.id}
                booking={{ ...booking, room }}
                onCancel={handleCancel}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-primary/10 py-20 px-8 text-center shadow-xl shadow-primary/5">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-primary mb-2 uppercase tracking-tight">No bookings found</h3>
          <p className="text-primary/40 text-sm font-medium mb-8 max-w-xs mx-auto">
            You haven&apos;t made any bookings in this category yet.
          </p>
          <Link
            href="/rooms"
            className="inline-block bg-action text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-tiger-orange transition-all shadow-xl shadow-action/20 active:scale-[0.98]"
          >
            Explore Rooms
          </Link>
        </div>
      )}
    </div>
  );
}