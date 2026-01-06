'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-primary/10 border border-primary/5 p-2 md:p-3">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch gap-2">
        {/* Check-in */}
        <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-primary/5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm font-black text-primary"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Check-out */}
        <div className="flex-1 px-6 py-3 border-b md:border-b-0 md:border-r border-primary/5">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm font-black text-primary"
            min={checkIn || new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Guests */}
        <div className="flex-1 px-6 py-3">
          <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm font-black text-primary appearance-none cursor-pointer"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-action text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-tiger-orange transition-all flex items-center justify-center gap-3 shadow-xl shadow-action/20 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;