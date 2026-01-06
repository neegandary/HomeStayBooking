'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ className = '' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amenities = ['Wifi', 'AC', 'Kitchen', 'Breakfast', 'Private Pool', 'Ocean View', 'Mountain View', 'City View'];

  const currentPrice = searchParams.get('maxPrice') || '1000';
  const selectedAmenities = searchParams.getAll('amenities');
  const currentCapacity = searchParams.get('guests') || '';

  const updateFilters = (key: string, value: string | string[], isArray = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (isArray) {
      params.delete(key);
      (value as string[]).forEach(v => params.append(key, v));
    } else {
      if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    }

    router.push(`/rooms?${params.toString()}`);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    updateFilters('amenities', newAmenities, true);
  };

  const handleClearAll = () => {
    router.push('/rooms');
  };

  return (
    <aside className={`bg-white rounded-xl border border-gray-100 p-6 h-fit ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-xs text-gray-500 hover:text-zinc-900 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Max Price</h4>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={currentPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="w-full accent-zinc-900"
          />
          <div className="flex justify-between text-xs text-gray-500 font-bold">
            <span>$0</span>
            <span className="text-zinc-900 text-sm">${currentPrice}</span>
            <span>$1000+</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Amenities</h4>
        <div className="space-y-3">
          {amenities.map((amenity) => (
            <label key={amenity} className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-900 accent-zinc-900 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Min. Capacity</h4>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 4, 6].map((num) => (
            <button
              key={num}
              onClick={() => updateFilters('guests', num.toString())}
              className={`py-2 text-xs border rounded-md transition-all font-medium ${
                currentCapacity === num.toString()
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;