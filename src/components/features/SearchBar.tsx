'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkIn, setCheckIn] = useState<Date | null>(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : null
  );
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    if (guests) params.set('guests', guests);

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-primary/10 border border-primary/5 p-2 md:p-3">
      <style jsx global>{`
        .search-datepicker {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          font-size: 0.875rem !important;
          font-weight: 900 !important;
          color: var(--color-primary, #1a1a2e) !important;
          cursor: pointer !important;
        }
        .search-datepicker::placeholder {
          color: rgba(26, 26, 46, 0.3) !important;
        }
        .react-datepicker-wrapper {
          width: 100% !important;
        }
        .react-datepicker__input-container {
          width: 100% !important;
        }
        .react-datepicker-popper {
          z-index: 50 !important;
        }
        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid rgba(26, 26, 46, 0.1) !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px -12px rgba(26, 26, 46, 0.15) !important;
        }
        .react-datepicker__header {
          background: white !important;
          border-bottom: 1px solid rgba(26, 26, 46, 0.05) !important;
          border-radius: 1rem 1rem 0 0 !important;
        }
        .react-datepicker__current-month {
          font-weight: 900 !important;
          color: #1a1a2e !important;
        }
        .react-datepicker__day-name {
          color: rgba(26, 26, 46, 0.4) !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day {
          color: #1a1a2e !important;
          font-weight: 700 !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__day:hover {
          background: rgba(26, 26, 46, 0.05) !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #1a1a2e !important;
          color: white !important;
        }
        .react-datepicker__day--disabled {
          color: rgba(26, 26, 46, 0.2) !important;
        }
      `}</style>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch gap-2">
        {/* Check-in */}
        <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-primary/5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Nhận phòng</label>
          <DatePicker
            selected={checkIn}
            onChange={(date: Date | null) => setCheckIn(date)}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            placeholderText="Chọn ngày"
            dateFormat="dd/MM/yyyy"
            className="search-datepicker"
          />
        </div>

        {/* Check-out */}
        <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-primary/5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Trả phòng</label>
          <DatePicker
            selected={checkOut}
            onChange={(date: Date | null) => setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || new Date()}
            placeholderText="Chọn ngày"
            dateFormat="dd/MM/yyyy"
            className="search-datepicker"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 px-6 py-3 relative">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Số khách</label>
          <div className="relative">
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm font-black text-primary appearance-none cursor-pointer pr-8"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} Khách</option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-action text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-tiger-orange transition-all flex items-center justify-center gap-3 shadow-xl shadow-action/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default SearchBar;