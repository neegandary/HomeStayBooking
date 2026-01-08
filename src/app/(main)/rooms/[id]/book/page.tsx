'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${id}`);
        if (response.ok) {
          const roomData = await response.json();
          setRoom(roomData);
          const availRes = await bookingService.getAvailability(id);
          setBookedDates(availRes.data.bookedDates);
        } else {
          router.push('/rooms');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        router.push('/rooms');
      }
    };
    fetchRoom();
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
      router.push(`/payment/${response.data.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="bg-white border-b border-primary/5 py-16 px-4 shadow-xl shadow-primary/5">
        <div className="container mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-primary/40 hover:text-action transition-colors mb-8 group uppercase text-[10px] font-black tracking-widest"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to room</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase">
            Confirm your booking
          </h1>
          <p className="text-primary/50 font-medium mt-6 text-lg">
            You are booking: <span className="text-primary font-black uppercase tracking-tight">{room.name}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 mt-16">
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