'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

function RoomsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Build API URL with current search params for server-side filtering
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      // Pass all search params to API for server-side filtering
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/rooms?${params.toString()}`);
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
  }, [searchParams]);

  // Re-fetch when search params change
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/rooms?${params.toString()}`);
  };

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
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-8 text-center tracking-tight uppercase">
            Tìm chuyến phiêu lưu <br /> tiếp theo của bạn
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
                <select className="text-[10px] font-black uppercase tracking-widest bg-transparent focus:outline-none cursor-pointer text-primary">
                  <option>Đề xuất</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Giá: Cao đến Thấp</option>
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
