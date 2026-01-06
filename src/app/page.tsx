import React from 'react';
import HeroSection from '@/components/features/HeroSection';
import RoomGrid from '@/components/features/RoomGrid';
import WeekOneShowcase from '@/components/features/WeekOneShowcase';
import { mockRooms } from '@/constants/mockRooms';
import Link from 'next/link';

export default function Home() {
  const featuredRooms = mockRooms.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Week 1 Showcase - Swiper Slider */}
      <WeekOneShowcase />

      {/* Featured Rooms Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-primary mb-6 tracking-tight uppercase">
                Featured Homestays
              </h2>
              <p className="text-primary/50 font-medium max-w-xl leading-relaxed">
                Handpicked properties with exceptional service and unique charm, perfect for your next stay.
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-primary font-black flex items-center gap-3 group border-b-2 border-transparent hover:border-action hover:text-action transition-all pb-2 w-fit uppercase text-xs tracking-widest"
            >
              Browse all rooms
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <RoomGrid rooms={featuredRooms} />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white border-t border-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-primary/5 shadow-xl shadow-primary/5 group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-8 h-8 text-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-primary mb-4 uppercase tracking-tight">Secure Booking</h3>
              <p className="text-primary/50 text-sm leading-relaxed font-medium">
                Your payments and personal data are always protected with our secure JWT-based authentication system.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-primary/5 shadow-xl shadow-primary/5 group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-8 h-8 text-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-primary mb-4 uppercase tracking-tight">Local Charm</h3>
              <p className="text-primary/50 text-sm leading-relaxed font-medium">
                We hand-select homestays that offer authentic local experiences and high-quality standards.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-primary/5 shadow-xl shadow-primary/5 group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-8 h-8 text-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-primary mb-4 uppercase tracking-tight">24/7 Support</h3>
              <p className="text-primary/50 text-sm leading-relaxed font-medium">
                Our dedicated team is available around the clock to assist you with your booking and stay.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}