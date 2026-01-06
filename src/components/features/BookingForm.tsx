'use client';

import React, { useState } from 'react';
import { Room } from '@/types/room';
import { BookingFormData } from '@/types/booking';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { useBookingPrice } from '@/hooks/useBookingPrice';

interface BookingFormProps {
  room: Room;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isLoading?: boolean;
  excludeDates?: string[];
}

const BookingForm: React.FC<BookingFormProps> = ({ room, onSubmit, isLoading, excludeDates = [] }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    roomId: room.id,
    checkIn: null,
    checkOut: null,
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });

  const { nights, subtotal, cleaningFee, serviceFee, total } = useBookingPrice(
    room.price,
    formData.checkIn,
    formData.checkOut
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    await onSubmit(formData);
  };

  const handleDateChange = (dates: { checkIn: string | null; checkOut: string | null }) => {
    setFormData(prev => ({ ...prev, ...dates }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Date Selection & Details */}
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Dates</h3>
            <DateRangePicker
              checkIn={formData.checkIn}
              checkOut={formData.checkOut}
              onChange={handleDateChange}
              excludeDates={excludeDates}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Your Details</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.guestEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.guestPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Guests</label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all appearance-none"
                >
                  {[...Array(room.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Special Requests (Optional)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all h-24 resize-none"
                  placeholder="Tell us about any extra needs..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Summary & Payment */}
        <div className="h-fit sticky top-24">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-zinc-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600 text-sm font-medium">
                <span className="underline decoration-gray-300 underline-offset-4">${room.price} x {nights} nights</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm font-medium">
                <span className="underline decoration-gray-300 underline-offset-4">Cleaning fee</span>
                <span>${cleaningFee}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm font-medium">
                <span className="underline decoration-gray-300 underline-offset-4">StayEasy service fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100 my-4" />
              <div className="flex justify-between text-gray-900 text-xl font-black">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || nights === 0}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] ${
                isLoading || nights === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200'
              }`}
            >
              {isLoading ? 'Processing...' : 'Confirm and Pay'}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium mt-4">
              By clicking the button above, you agree to our terms of service and cancellation policy.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;