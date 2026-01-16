'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import BookingTable from '@/components/admin/BookingTable';

interface AdminBooking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const { data } = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchBookings, 300);
    return () => clearTimeout(debounce);
  }, [fetchBookings]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleStatusChange = async (
    id: string,
    status: AdminBooking['status']
  ) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  // Pagination
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats summary
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    checkedIn: bookings.filter((b) => b.status === 'checked-in').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-3xl font-bold leading-tight tracking-tight">
          Manage Bookings
        </h1>
        <div className="flex items-center gap-4">
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white border border-primary/10 text-foreground text-sm font-bold leading-normal hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined text-xl mr-2">download</span>
            <span className="truncate">Export</span>
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-primary/10">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-highlight/5 rounded-xl p-4 border border-highlight/10">
          <p className="text-xs font-medium text-highlight uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-highlight">{stats.pending}</p>
        </div>
        <div className="bg-success/5 rounded-xl p-4 border border-success/10">
          <p className="text-xs font-medium text-success uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Checked-in</p>
          <p className="text-2xl font-bold text-primary">{stats.checkedIn}</p>
        </div>
        <div className="bg-action/5 rounded-xl p-4 border border-action/10">
          <p className="text-xs font-medium text-action uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-action">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter & Search Module */}
      <div className="bg-white p-4 rounded-xl border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SearchBar */}
          <div className="lg:col-span-2">
            <label className="flex flex-col h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-muted flex bg-primary/5 items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border-none bg-primary/5 h-full placeholder:text-muted pl-2 text-sm font-normal leading-normal"
                  placeholder="Search by guest name, booking ID..."
                />
              </div>
            </label>
          </div>

          {/* Status Filter */}
          <button
            onClick={() => {
              const statuses = ['all', 'pending', 'confirmed', 'checked-in', 'cancelled'];
              const currentIndex = statuses.indexOf(statusFilter);
              const nextIndex = (currentIndex + 1) % statuses.length;
              setStatusFilter(statuses[nextIndex]);
            }}
            className="flex h-12 items-center justify-between gap-x-2 rounded-lg bg-primary/5 px-4 text-foreground hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-x-2">
              <span className="material-symbols-outlined text-xl text-muted">filter_list</span>
              <p className="text-sm font-medium leading-normal">
                Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </p>
            </div>
            <span className="material-symbols-outlined text-xl text-muted">expand_more</span>
          </button>

          {/* Date Range (placeholder) */}
          <button className="flex h-12 items-center justify-between gap-x-2 rounded-lg bg-primary/5 px-4 text-foreground hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-x-2">
              <span className="material-symbols-outlined text-xl text-muted">date_range</span>
              <p className="text-sm font-medium leading-normal">Date Range</p>
            </div>
            <span className="material-symbols-outlined text-xl text-muted">expand_more</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <BookingTable
        bookings={paginatedBookings}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={bookings.length}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
