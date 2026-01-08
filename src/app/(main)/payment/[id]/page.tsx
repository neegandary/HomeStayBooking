'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
import { Room } from '@/types/room';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error from VNPay redirect
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const codeParam = searchParams.get('code');
    if (errorParam) {
      setError(`Payment failed: ${errorParam}${codeParam ? ` (Code: ${codeParam})` : ''}`);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookingService.getById(id);
        const bookingData = response.data;
        setBooking(bookingData);

        // Fetch room from API if roomId exists
        if (bookingData.roomId) {
          const roomResponse = await fetch(`/api/rooms/${bookingData.roomId}`);
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            setRoom(roomData);
          }
        }

        // If already confirmed, redirect to confirmation page
        if (bookingData.status === 'confirmed') {
          router.push(`/booking/${id}`);
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handlePayWithVNPay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${id}/pay`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      
      // Redirect to VNPay payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

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
        <button onClick={() => router.back()} className="text-action font-black uppercase tracking-widest text-xs border-b-2 border-action/20 pb-1 hover:border-action transition-all">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32 pt-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Payment Instructions */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[0.9]">
                Complete Your <br /> Payment
              </h1>
              <p className="text-primary/50 font-medium text-lg max-w-md leading-relaxed">
                Click the button below to pay securely via VNPay.
              </p>
            </div>

            {/* VNPay Payment Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10 border border-primary/5">
              <div className="text-center space-y-8">
                {/* VNPay Logo */}
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl">
                    <span className="text-2xl font-black tracking-tight">VNPAY</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-5xl font-black text-primary tracking-tighter">
                    10.000đ
                  </div>
                  <p className="text-primary/40 text-xs font-black uppercase tracking-widest">
                    Test Amount (Sandbox)
                  </p>
                </div>

                <button
                  onClick={handlePayWithVNPay}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pay with VNPay
                    </>
                  )}
                </button>

                <p className="text-primary/30 text-[10px] font-bold uppercase tracking-widest">
                  Secure payment powered by VNPay
                </p>
              </div>
            </div>

            {/* Supported Banks */}
            <div className="text-center">
              <p className="text-primary/30 text-[10px] font-black uppercase tracking-widest mb-4">
                Supported payment methods
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {['VISA', 'MasterCard', 'JCB', 'ATM/Bank'].map((method) => (
                  <div key={method} className="px-4 py-2 bg-primary/5 rounded-xl text-[10px] font-black text-primary/60 uppercase tracking-widest">
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="h-fit sticky top-28">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10 border border-primary/5">
              <h3 className="text-xl font-black text-primary mb-8 uppercase tracking-tight">Order Summary</h3>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-primary uppercase tracking-tight leading-none">{room.name}</h4>
                    <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest">
                      {booking.checkIn} — {booking.checkOut}
                    </p>
                    <p className="text-primary/40 text-[10px] font-black uppercase tracking-widest">
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>

                <hr className="border-primary/5" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                    <span>Amount</span>
                    <span className="text-primary">{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                    <span>Booking ID</span>
                    <span className="text-primary">#{booking.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Total to pay</span>
                    <span className="text-3xl font-black text-action tracking-tighter">{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-secondary/5 rounded-3xl border border-secondary/10">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-primary/60 leading-relaxed">
                    Once the transfer is successful, your booking will be confirmed automatically. Please do not close this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
