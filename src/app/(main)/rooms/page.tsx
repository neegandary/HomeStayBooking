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
    <div className="bg-gray-50 min-h-screen">
      {/* Search Bar Header */}
      <div className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            Find your next adventure
          </h1>
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <FilterSidebar className="sticky top-24" />
          </div>

          {/* Room List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Available Rooms <span className="text-gray-400 font-normal text-sm ml-2">({filteredRooms.length} found)</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    }>
      <RoomsContent />
    </Suspense>
  );
}