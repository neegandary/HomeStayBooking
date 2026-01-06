import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockRooms } from '@/constants/mockRooms';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = mockRooms.find((r) => r.id === id);
  return {
    title: room ? `${room.name} | StayEasy` : 'Room Not Found',
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = mockRooms.find((r) => r.id === id);

  if (!room) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Photo Gallery - Hero Carousel */}
      <div className="h-[40vh] md:h-[60vh] relative">
        <ImageCarousel images={room.images} className="h-full" />
        <Link
          href="/rooms"
          className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                Entire Homestay
              </span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-600 text-sm font-medium">
                Up to {room.capacity} guests
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">
              {room.name}
            </h1>

            <div className="prose prose-zinc max-w-none text-gray-600 mb-10">
              <p className="text-lg leading-relaxed">
                {room.description}
              </p>
            </div>

            <hr className="border-gray-100 mb-10" />

            {/* Amenities Section */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 text-gray-400">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-gray-100 mb-10" />

            {/* Location Placeholder */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Where you&apos;ll be</h2>
              <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <div className="text-gray-400 mb-2 font-bold uppercase tracking-widest text-xs">Map View</div>
                  <div className="text-gray-400 text-sm">Interactive map integration coming soon</div>
                </div>
              </div>
            </section>
          </div>

          {/* Booking Sidebar - Sticky */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-zinc-200">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-3xl font-black text-gray-900">${room.price}</span>
                  <span className="text-gray-500 font-medium ml-1">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  4.8
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <Link
                  href={`/rooms/${room.id}/book`}
                  className="block w-full text-center bg-zinc-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                >
                  Reserve Now
                </Link>
                <p className="text-center text-xs text-gray-400 font-medium">You won&apos;t be charged yet</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm font-medium">
                  <span className="underline decoration-gray-300 underline-offset-4">${room.price} x 5 nights</span>
                  <span>${room.price * 5}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm font-medium">
                  <span className="underline decoration-gray-300 underline-offset-4">Cleaning fee</span>
                  <span>$35</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm font-medium">
                  <span className="underline decoration-gray-300 underline-offset-4">StayEasy service fee</span>
                  <span>$42</span>
                </div>
                <hr className="border-gray-100 my-4" />
                <div className="flex justify-between text-gray-900 text-lg font-black">
                  <span>Total</span>
                  <span>${room.price * 5 + 77}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}