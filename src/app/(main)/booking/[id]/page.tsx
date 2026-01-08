'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
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
        
        // Fetch room from API
        // Fetch room from API if roomId exists
        if (response.data.roomId) {
          const roomResponse = await fetch(`/api/rooms/${response.data.roomId}`);
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            setRoom(roomData);
          }
        }
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
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary/5 px-4 text-center">
        <h1 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">Booking not found</h1>
        <Link href="/rooms" className="text-action font-black uppercase tracking-widest text-xs border-b-2 border-action/20 pb-1 hover:border-action transition-all">Back to browsing</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-primary/10 text-center border border-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>

          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-10">
            <svg className="w-12 h-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl! md:text-5xl font-black text-primary mb-6 tracking-tight uppercase">
            Booking Confirmed!
          </h1>
          <p className="text-primary/50 font-medium mb-12 leading-relaxed">
            Thank you for choosing StayEasy. Your reservation is confirmed and we&apos;ve sent the details to your email.
          </p>

          <div className="bg-primary/5 rounded-3xl p-8 text-left space-y-6 mb-12 border border-primary/5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Booking ID</span>
              <span className="text-sm font-black text-primary tracking-tighter">#{booking.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Property</span>
              <span className="text-sm font-black text-primary uppercase tracking-tight">{room.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Dates</span>
              <span className="text-sm font-black text-primary">{booking.checkIn} to {booking.checkOut}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Guests</span>
              <span className="font-black text-primary uppercase tracking-widest text-xs">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <hr className="border-primary/5" />
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Total Amount</span>
              <span className="text-3xl font-black text-primary tracking-tighter">{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Check-in QR Code Section */}
          <div className="bg-gradient-to-br from-secondary/5 to-action/5 rounded-3xl p-8 mb-12 border border-secondary/10">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-2">Check-in QR Code</h3>
            <p className="text-primary/40 text-xs font-medium mb-6">
              Show this QR code to your host when you arrive for quick check-in
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'CHECKIN',
                    bookingId: booking.id,
                    roomId: booking.roomId,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    guests: booking.guests,
                  })}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Scan with host&apos;s device</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard"
              className="bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-deep-space transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              Manage Bookings
            </Link>
            <Link
              href="/"
              className="bg-white text-primary border-2 border-primary/10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all active:scale-[0.98]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}