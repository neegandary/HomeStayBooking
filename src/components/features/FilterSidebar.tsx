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

  const currentPrice = searchParams.get('maxPrice') || '20000000';
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
    <aside className={`bg-white rounded-3xl border border-primary/5 p-8 shadow-xl shadow-primary/5 h-fit ${className}`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-primary uppercase tracking-widest text-sm">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-action transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6">Max Price</h4>
        <div className="space-y-6">
          <input
            type="range"
            min="0"
            max="20000000"
            step="500000"
            value={currentPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="w-full h-1.5 bg-primary/5 rounded-lg appearance-none cursor-pointer accent-action"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary/20">0đ</span>
            <div className="bg-primary/5 px-3 py-1 rounded-lg">
              <span className="text-primary font-black text-sm">{parseInt(currentPrice).toLocaleString('vi-VN')}đ</span>
            </div>
            <span className="text-[10px] font-black text-primary/20">20M+</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-10">
        <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6">Amenities</h4>
        <div className="space-y-4">
          {amenities.map((amenity) => (
            <label key={amenity} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-5 h-5 rounded-lg border-2 border-primary/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                />
              </div>
              <span className="ml-4 text-xs font-bold text-primary/60 group-hover:text-primary transition-colors">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6">Min. Capacity</h4>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 4, 6].map((num) => (
            <button
              key={num}
              onClick={() => updateFilters('guests', num.toString())}
              className={`py-2.5 text-[10px] font-black border-2 rounded-xl transition-all ${
                currentCapacity === num.toString()
                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                  : 'border-primary/5 text-primary/40 hover:border-primary/20 hover:bg-primary/5'
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