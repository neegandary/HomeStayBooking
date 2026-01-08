'use client';

import React from 'react';

interface Booking {
  id: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
}

const statusStyles = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function BookingTable({ bookings, onStatusChange }: BookingTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/5 bg-primary/[0.02]">
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Guest
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Room
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Dates
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Guests
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-primary">{booking.guestName}</p>
                  <p className="text-xs text-primary/60">{booking.guestEmail}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-primary/80">{booking.roomName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-primary/80">
                    {new Date(booking.checkIn).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' - '}
                    {new Date(booking.checkOut).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-primary/80">{booking.guests}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-primary">{booking.totalPrice.toLocaleString('vi-VN')}đ</p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      onStatusChange(
                        booking.id,
                        e.target.value as 'pending' | 'confirmed' | 'cancelled'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border-0 cursor-pointer transition-colors ${statusStyles[booking.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-primary/60">No bookings found.</p>
        </div>
      )}
    </div>
  );
}