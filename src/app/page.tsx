import React from 'react';
import HeroSection from '@/components/features/HeroSection';
import RoomGrid from '@/components/features/RoomGrid';
import FeatureCards from '@/components/features/FeatureCards';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import Footer from '@/components/layout/Footer';

// Force dynamic rendering to avoid prerender errors with MongoDB
export const dynamic = 'force-dynamic';

async function getFeaturedRooms() {
  try {
    await connectDB();
    const rooms = await Room.find({}).limit(4).lean();
    return JSON.parse(JSON.stringify(rooms));
  } catch (error) {
    console.error('Failed to fetch featured rooms:', error);
    return [];
  }
}

export default async function Home() {
  const featuredRooms = await getFeaturedRooms();

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Rooms Section */}
      <section className="py-10 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <h2 className="text-primary text-3xl font-black uppercase tracking-tight">
              OUR FEATURED ROOMS
            </h2>
          </div>
          <RoomGrid rooms={featuredRooms} />
          <div className="mt-8 text-center">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-action transition-colors"
            >
              View all rooms
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* Footer */}
      <Footer />
    </div>
  );
}
