'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/features/SearchBar';
import FilterSidebar from '@/components/features/FilterSidebar';
import RoomGrid from '@/components/features/RoomGrid';
import { Room } from '@/types/room';

interface RoomsResponse {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hook to sync search params with shallow navigation events
function useShallowSearchParams() {
  const searchParams = useSearchParams();
  // Use a ref to track current params without triggering re-renders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentParamsRef = useRef<any>(searchParams);

  useEffect(() => {
    const handleShallowNav = () => {
      // Update from current URL without full reload
      const url = new URL(window.location.href);
      const newParams = new URLSearchParams(url.search);
      currentParamsRef.current = newParams;
      // Force re-render
      setSearchParamsObj(newParams);
    };

    window.addEventListener('shallow-navigation', handleShallowNav);
    return () => window.removeEventListener('shallow-navigation', handleShallowNav);
  }, []);

  // State to trigger re-renders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setSearchParamsObj] = useState<any>(searchParams);

  return currentParamsRef.current;
}

function RoomsContent() {
  const searchParams = useShallowSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const previousParams = useRef<string>('');

  // Get current sort values from URL
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Build API URL with current search params for server-side filtering
  const fetchRooms = useCallback(async () => {
    const paramsString = searchParams.toString();

    // Skip if params haven't changed
    if (paramsString === previousParams.current && rooms.length > 0) {
      return;
    }

    previousParams.current = paramsString;
    setLoading(true);

    try {
      const response = await fetch(`/api/rooms?${paramsString}`);
      if (response.ok) {
        const data: RoomsResponse = await response.json();
        setRooms(data.rooms);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, rooms.length]);

  // Re-fetch when search params change
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle page change with shallow navigation
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const url = `/rooms?${params.toString()}`;

    // Shallow navigation - update URL without full page reload
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('shallow-navigation'));
  }, [searchParams]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to first page on sort

    switch (value) {
      case 'price-asc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'asc');
        break;
      case 'price-desc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'desc');
        break;
      default:
        params.delete('sortBy');
        params.delete('sortOrder');
    }

    const url = `/rooms?${params.toString()}`;
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('shallow-navigation'));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary/60 font-medium">Đang tải phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Search Bar Header */}
      <div className="bg-white border-b border-primary/5 py-12 px-4 shadow-xl shadow-primary/5">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-2  text-center tracking-tight uppercase">
            Tìm chuyến phiêu lưu 
          </h1>
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-8  text-center tracking-tight uppercase">
            tiếp theo của bạn
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
                Phòng có sẵn <span className="text-primary/20 font-black text-sm ml-3">/ {total} kết quả</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Sắp xếp:</span>
                <select
                  value={sortBy === 'createdAt' ? 'default' : `price-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest bg-transparent focus:outline-none cursor-pointer text-primary"
                >
                  <option value="default">Đề xuất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            <RoomGrid rooms={rooms} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'bg-primary/5 text-primary hover:bg-primary/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
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
