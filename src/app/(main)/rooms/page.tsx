'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/features/SearchBar';
import FilterSidebar from '@/components/features/FilterSidebar';
import RoomGrid from '@/components/features/RoomGrid';
import { mockRooms } from '@/constants/mockRooms';

function RoomsContent() {
  const searchParams = useSearchParams();

  const filteredRooms = useMemo(() => {
    const maxPrice = parseInt(searchParams.get('maxPrice') || '1000');
    const minGuests = parseInt(searchParams.get('guests') || '1');
    const selectedAmenities = searchParams.getAll('amenities');

    return mockRooms.filter(room => {
      // Price filter
      if (room.price > maxPrice) return false;

      // Capacity filter
      if (room.capacity < minGuests) return false;

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity =>
          room.amenities.some(roomAmenity =>
            roomAmenity.toLowerCase() === amenity.toLowerCase()
          )
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [searchParams]);

  return (
    <div className="bg-white min-h-screen">
      {/* Search Bar Header */}
      <div className="bg-white border-b border-primary/5 py-12 px-4 shadow-xl shadow-primary/5">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-8 text-center tracking-tight uppercase">
            Find your next <br /> adventure
          </h1>
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <FilterSidebar className="sticky top-28" />
          </div>

          {/* Room List */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-8 border-b border-primary/5 pb-6">
              <h2 className="text-xl font-black text-primary uppercase tracking-widest">
                Available Rooms <span className="text-primary/20 font-black text-sm ml-3">/ {filteredRooms.length} found</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Sort by:</span>
                <select className="text-[10px] font-black uppercase tracking-widest bg-transparent focus:outline-none cursor-pointer text-primary">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            <RoomGrid rooms={filteredRooms} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <RoomsContent />
    </Suspense>
  );
}