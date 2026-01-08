'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import BookingTable from '@/components/admin/BookingTable';
import SearchFilter from '@/components/admin/SearchFilter';

interface AdminBooking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleStatusChange = async (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Stats summary
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Booking Management
        </h1>
        <p className="text-primary/60 mt-1">
          View and manage all guest reservations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-primary/5">
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Total</p>
          <p className="text-2xl font-black text-primary">{stats.total}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-xs font-bold text-orange-600/60 uppercase tracking-widest">Pending</p>
          <p className="text-2xl font-black text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">Confirmed</p>
          <p className="text-2xl font-black text-emerald-600">{stats.confirmed}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest">Cancelled</p>
          <p className="text-2xl font-black text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          placeholder="Search by guest name, email, or room..."
        />
      </div>

      {/* Table */}
      <BookingTable bookings={bookings} onStatusChange={handleStatusChange} />
    </div>
  );
}