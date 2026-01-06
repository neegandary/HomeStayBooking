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
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Date Selection & Details */}
        <div className="space-y-10">
          <section>
            <h3 className="text-xl font-black text-primary mb-6 uppercase tracking-tight">Select Dates</h3>
            <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-xl shadow-primary/5">
              <DateRangePicker
                checkIn={formData.checkIn}
                checkOut={formData.checkOut}
                onChange={handleDateChange}
                excludeDates={excludeDates}
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">Your Details</h3>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-primary/20"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.guestEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-primary/20"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.guestPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-primary/20"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Guests</label>
                <div className="relative">
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Special Requests (Optional)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all h-32 resize-none placeholder:text-primary/20 leading-relaxed"
                  placeholder="Tell us about any extra needs..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Summary & Payment */}
        <div className="h-fit sticky top-28">
          <div className="bg-primary text-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Price Summary</h3>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-white/10 underline-offset-8">${room.price} x {nights} nights</span>
                  <span className="text-white">${subtotal}</span>
                </div>
                <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-white/10 underline-offset-8">Cleaning fee</span>
                  <span className="text-white">${cleaningFee}</span>
                </div>
                <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-white/10 underline-offset-8">Service fee</span>
                  <span className="text-white">${serviceFee.toFixed(2)}</span>
                </div>
                <hr className="border-white/10 my-8" />
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Price</span>
                  <span className="text-4xl font-black tracking-tighter text-action">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || nights === 0}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${
                  isLoading || nights === 0
                    ? 'bg-white/10 text-white/20 cursor-not-allowed'
                    : 'bg-action text-white hover:bg-tiger-orange shadow-action/40'
                }`}
              >
                {isLoading ? 'Processing...' : 'Confirm and Pay'}
              </button>
              <p className="text-center text-[10px] text-white/30 font-bold mt-6 leading-relaxed">
                Secure payment powered by StayEasy. <br />
                By paying, you agree to our policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;