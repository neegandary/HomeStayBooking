import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getRoom(id: string) {
  try {
    await connectDB();
    const room = await Room.findById(id).lean();
    return room ? JSON.parse(JSON.stringify(room)) : null;
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return null;
  }
}

export async function generateMetadata({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await getRoom(id);
  return {
    title: room ? `${room.name} | StayEasy` : 'Room Not Found',
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Photo Gallery - Hero Carousel */}
      <div className="h-[50vh] md:h-[70vh] relative overflow-hidden group">
        <ImageCarousel images={room.images} className="h-full transition-transform duration-700 group-hover:scale-105" />
        <Link
          href="/rooms"
          className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl shadow-black/10 hover:bg-white transition-all active:scale-95 flex items-center gap-2 group/btn"
        >
          <svg className="w-5 h-5 text-primary transition-transform group-hover/btn:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest pr-2">Back</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 mt-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tight">
              {room.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-8">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <svg className="w-4 h-4 text-secondary fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>4.9</span>
                <span className="text-primary/40 underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">(124 reviews)</span>
              </div>
              <span className="text-primary/10">•</span>
              <div className="flex items-center gap-1.5 text-primary/60 font-medium underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                Santa Monica, California, United States
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-12 py-6 border-y border-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-primary uppercase tracking-widest">{room.capacity} Guests</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-primary uppercase tracking-widest">1 Bedroom</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-primary uppercase tracking-widest">1 Bed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-black text-primary uppercase tracking-widest">1 Bath</div>
                </div>
              </div>
            </div>

            <div className="prose prose-primary max-w-none text-primary/60 mb-16 leading-relaxed">
              <p className="text-xl font-medium">
                {room.description}
              </p>
            </div>

            <hr className="border-primary/5 mb-16" />

            {/* Amenities Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-black text-primary mb-10 uppercase tracking-tight">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {room.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-4 text-primary group">
                    <div className="w-8 h-8 bg-primary/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-primary/70">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-primary/5 mb-16" />

            {/* Location Placeholder */}
            <section>
              <h2 className="text-2xl font-black text-primary mb-10 uppercase tracking-tight">Where you&apos;ll be</h2>
              <div className="aspect-video bg-white rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center relative z-10">
                  <div className="text-primary/20 mb-3 font-black uppercase tracking-[0.3em] text-[10px]">Map View</div>
                  <div className="text-primary/40 text-sm font-bold">Interactive map integration coming soon</div>
                </div>
              </div>
            </section>
          </div>

          {/* Booking Sidebar - Sticky */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="sticky top-28 bg-white border border-primary/5 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <span className="text-4xl font-black text-primary tracking-tighter">{room.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-primary/40 font-black uppercase tracking-widest text-[10px] ml-2">/ night</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl">
                  <svg className="w-4 h-4 text-highlight fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  4.8
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <Link
                  href={`/rooms/${room._id}/book`}
                  className="block w-full text-center bg-action text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-tiger-orange transition-all shadow-xl shadow-action/30 active:scale-[0.98]"
                >
                  Reserve Now
                </Link>
                <p className="text-center text-[10px] text-primary/30 font-black uppercase tracking-widest">You won&apos;t be charged yet</p>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-primary/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-primary/10 underline-offset-8">{room.price.toLocaleString('vi-VN')}đ x 5 nights</span>
                  <span className="text-primary">{(room.price * 5).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-primary/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-primary/10 underline-offset-8">Cleaning fee</span>
                  <span className="text-primary">150.000đ</span>
                </div>
                <div className="flex justify-between text-primary/50 text-xs font-black uppercase tracking-widest">
                  <span className="underline decoration-primary/10 underline-offset-8">Service fee</span>
                  <span className="text-primary">{(room.price * 5 * 0.05).toLocaleString('vi-VN')}đ</span>
                </div>
                <hr className="border-primary/5 my-8" />
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">Total</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">{(room.price * 5 + 150000 + (room.price * 5 * 0.05)).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}