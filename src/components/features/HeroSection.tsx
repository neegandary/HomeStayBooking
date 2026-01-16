'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const heroImages = useMemo(() => [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80',
  ], []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    router.push(`/rooms?${params.toString()}`);
  }, [searchQuery, checkIn, checkOut, guests, router]);

  const goToSlide = useCallback((index: number) => setCurrentSlide(index), []);

  return (
    <section className="@container py-10 px-4 sm:px-0">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative group flex min-h-[520px] flex-col gap-6 overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
          {/* Background Carousel */}
          <div
            className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="min-w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%), url("${image}")`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-grow items-start justify-end px-4 pb-10 sm:px-10">
            <div className="flex flex-col gap-2 text-left max-w-2xl">
              <h1 className="text-white text-4xl font-black leading-tight tracking-tight uppercase sm:text-5xl">
                TÌM HOMESTAY HOÀN HẢO CỦA BẠN
              </h1>
              <h2 className="text-white text-base font-normal leading-normal sm:text-lg">
                Những ngôi nhà được tuyển chọn cho kỳ nghỉ khó quên.
              </h2>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-6xl bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl shadow-black/20 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                {/* Search Input */}
                <label className="flex flex-col min-w-40 h-14 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-muted flex bg-white items-center justify-center pl-4 rounded-l-lg border border-primary/20 border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-primary focus:outline-none focus:ring-0 border border-primary/20 bg-white focus:border-action h-full placeholder:text-muted px-4 rounded-l-none border-l-0 text-base font-normal leading-normal"
                      placeholder="Điểm đến, vd: Đà Lạt"
             />
                  </div>
                </label>

                {/* Date Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full h-14 rounded-lg text-primary focus:outline-none focus:ring-0 border border-primary/20 bg-white focus:border-action placeholder:text-muted px-4 text-base font-normal leading-normal"
                    placeholder="Check-in"
           />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full h-14 rounded-lg text-primary focus:outline-none focus:ring-0 border border-primary/20 bg-white focus:border-action placeholder:text-muted px-4 text-base font-normal leading-normal"
                    placeholder="Check-out"
                  />
                </div>

                {/* Guests Input */}
                <input
                  type="number"
      min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full h-14 rounded-lg text-primary focus:outline-none focus:ring-0 border border-primary/20 bg-white focus:border-action placeholder:text-muted px-4 text-base font-normal leading-normal"
                  placeholder="Số khách"
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-action text-white text-base font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-colors"
                >
                  <span className="truncate">Tìm kiếm</span>
                </button>
              </div>
            </form>
          </div>

          {/* Carousel Dots */}
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full ring-1 ring-white/60 transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
