'use client';

import React from 'react';
import Link from 'next/link';
import { Booking } from '@/types/booking';
import { Room } from '@/types/room';

interface BookingCardProps {
  booking: Booking & { room?: Room };
  onCancel?: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const statusColors = {
    confirmed: 'bg-secondary/10 text-secondary',
    pending: 'bg-highlight/10 text-highlight',
    cancelled: 'bg-red-50 text-red-500',
    completed: 'bg-primary/5 text-primary/60',
  };

  const isUpcoming = new Date(booking.checkIn) > new Date();
  const canCancel = isUpcoming && booking.status !== 'cancelled';

  return (
    <div className="bg-white rounded-3xl border border-primary/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden bg-primary/5">
          {booking.room?.images?.[0] ? (
            <img
              src={booking.room.images[0]}
              alt={booking.room.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/10">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[booking.status as keyof typeof statusColors] || 'bg-primary/5 text-primary/60'}`}>
            {booking.status}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black text-primary tracking-tight group-hover:text-secondary transition-colors uppercase">
                {booking.room?.name || `Booking #${booking.id.slice(0, 8)}`}
              </h3>
              <span className="text-xl font-black text-primary tracking-tighter">{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Check-in</span>
                <span className="text-sm font-bold text-primary">{booking.checkIn}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Check-out</span>
                <span className="text-sm font-bold text-primary">{booking.checkOut}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Link
              href={`/booking/${booking.id}`}
              className="flex-1 bg-primary/5 text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-center active:scale-[0.98]"
            >
              View Receipt
            </Link>
            {booking.status === 'pending' && (
              <Link
                href={`/payment/${booking.id}`}
                className="flex-1 bg-action text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-tiger-orange transition-all text-center shadow-lg shadow-action/20 active:scale-[0.98]"
              >
                Pay Now
              </Link>
            )}
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(booking.id)}
                className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;