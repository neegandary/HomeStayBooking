'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
import { mockRooms } from '@/constants/mockRooms';
import { Room } from '@/types/room';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await bookingService.getById(id);
        setBooking(response.data);
        const foundRoom = mockRooms.find(r => r.id === response.data.roomId);
        if (foundRoom) setRoom(foundRoom);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!booking || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h1>
        <Link href="/rooms" className="text-zinc-900 font-bold underline">Back to browsing</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-zinc-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 font-medium mb-10">
            Thank you for choosing StayEasy. Your reservation is confirmed and we&apos;ve sent the details to your email.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-10 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</span>
              <span className="text-sm font-bold text-zinc-900">#{booking.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Property</span>
              <span className="text-sm font-bold text-zinc-900">{room.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dates</span>
              <span className="text-sm font-bold text-zinc-900">{booking.checkIn} to {booking.checkOut}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guests</span>
              <span className="text-sm font-bold text-zinc-900">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Paid</span>
              <span className="text-lg font-black text-zinc-900">${booking.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/bookings"
              className="bg-zinc-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
            >
              Manage Bookings
            </Link>
            <Link
              href="/"
              className="bg-white text-zinc-900 border border-gray-200 py-4 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}