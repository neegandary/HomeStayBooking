'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { mockRooms } from '@/constants/mockRooms';
import { Room } from '@/types/room';
import BookingForm from '@/components/features/BookingForm';
import { BookingFormData } from '@/types/booking';
import { bookingService } from '@/lib/bookingService';
import { useAuth } from '@/hooks/useAuth';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => {
    const foundRoom = mockRooms.find(r => r.id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      bookingService.getAvailability(id).then(res => {
        setBookedDates(res.data.bookedDates);
      });
    } else {
      router.push('/rooms');
    }
  }, [id, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/rooms/${id}/book`);
    }
  }, [authLoading, isAuthenticated, router, id]);

  const handleBookingSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await bookingService.create(data);
      router.push(`/booking/${response.data.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-zinc-900 transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-bold">Back to room</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Confirm your booking
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            You are booking: <span className="text-zinc-900 font-bold">{room.name}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 mt-12">
        <BookingForm
          room={room}
          onSubmit={handleBookingSubmit}
          isLoading={isSubmitting}
          excludeDates={bookedDates}
        />
      </div>
    </div>
  );
}