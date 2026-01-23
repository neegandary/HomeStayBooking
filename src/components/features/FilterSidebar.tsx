'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
  className?: string;
}

// Custom hook for shallow routing
function useShallowSearchParams() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentParamsRef = useRef<any>(searchParams);

  useEffect(() => {
    const handleShallowNav = () => {
      const url = new URL(window.location.href);
      const newParams = new URLSearchParams(url.search);
      currentParamsRef.current = newParams;
      setSearchParamsObj(newParams);
    };

    window.addEventListener('shallow-navigation', handleShallowNav);
    return () => window.removeEventListener('shallow-navigation', handleShallowNav);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setSearchParamsObj] = useState<any>(searchParams);

  return currentParamsRef.current;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ className = '' }) => {
  const searchParams = useShallowSearchParams();

  const currentPrice = searchParams.get('maxPrice') || '20000000';
  const selectedAmenities: string[] = searchParams.getAll('amenities');
  const currentCapacity = searchParams.get('guests') || '';

  // Shallow navigation - update URL without full page reload
  const shallowPush = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('shallow-navigation'));
    }
  }, []);

  const updateFilters = useCallback((key: string, value: string | string[], isArray = false) => {
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

    shallowPush(`/rooms?${params.toString()}`);
  }, [searchParams, shallowPush]);

  const handleClearAll = useCallback(() => {
    shallowPush('/rooms');
  }, [shallowPush]);

  return (
    <aside className={`bg-white rounded-3xl border border-primary/5 p-8 shadow-xl shadow-primary/5 h-fit ${className}`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-primary uppercase tracking-widest text-sm">Bộ lọc</h3>
        <button
          onClick={handleClearAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-action transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6">Giá tối đa</h4>
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

      {/* Capacity */}
      <div>
        <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6">Sức chứa tối thiểu</h4>
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