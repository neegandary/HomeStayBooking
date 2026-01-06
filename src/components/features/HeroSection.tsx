'use client';

import React, { Suspense } from 'react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import SearchBar from './SearchBar';

const HeroSection = () => {
  const heroImages = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1449156001533-cb39c7160759?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80',
  ];

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <ImageCarousel
          images={heroImages}
          autoplay={true}
          showNavigation={false}
          showPagination={false}
          className="h-full"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight max-w-4xl">
          Find Your Perfect <br className="hidden md:block" />
          <span className="text-white/80">Homestay Experience</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl font-medium">
          Discover unique spaces, cozy cabins, and luxury villas curated just for your next unforgettable journey.
        </p>

        {/* Search Bar Integration */}
        <div className="w-full max-w-5xl">
          <Suspense fallback={<div className="h-16 w-full bg-white/10 animate-pulse rounded-2xl" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Floating Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-white/80 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Rated Stays
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Hosts
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Free Cancellation
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;