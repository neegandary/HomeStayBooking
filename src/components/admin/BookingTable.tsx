'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';

interface Booking {
  id: string;
  roomName: string;
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

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: Booking['status']) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

// Status badge styles using theme colors
const getStatusStyle = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-success/10 text-success';
    case 'checked-in':
      return 'bg-primary/10 text-primary';
    case 'pending':
      return 'bg-highlight/10 text-highlight';
    case 'cancelled':
      return 'bg-action/10 text-action';
    case 'completed':
      return 'bg-muted/10 text-muted';
    default:
      return 'bg-muted/10 text-muted';
  }
};

const getStatusLabel = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'checked-in':
      return 'Checked-in';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

function BookingTable({
  bookings,
  onStatusChange,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
}: BookingTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleToggleMenu = useCallback((bookingId: string) => {
    setActionMenuOpen(prev => prev === bookingId ? null : bookingId);
  }, []);

  const handleStatusChange = useCallback((bookingId: string, status: Booking['status']) => {
    onStatusChange(bookingId, status);
    setActionMenuOpen(null);
  }, [onStatusChange]);

  const startItem = useMemo(() => (currentPage - 1) * itemsPerPage + 1, [currentPage, itemsPerPage]);
  const endItem = useMemo(() => Math.min(currentPage * itemsPerPage, totalItems), [currentPage, itemsPerPage, totalItems]);

  return (
    <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-primary/[0.02]">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium text-muted">Booking ID</th>
              <th className="px-4 py-3 font-medium text-muted">Guest Name</th>
              <th className="px-4 py-3 font-medium text-muted">Check-in</th>
              <th className="px-4 py-3 font-medium text-muted">Check-out</th>
              <th className="px-4 py-3 font-medium text-muted">Room</th>
              <th className="px-4 py-3 font-medium text-muted">Status</th>
              <th className="px-4 py-3 font-medium text-muted text-right">Total</th>
              <th className="px-4 py-3 font-medium text-muted text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {bookings.map((booking) => (
              <tr key={booking.id} className="text-foreground hover:bg-primary/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  #{booking.id.slice(-6).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{booking.guestName}</p>
                  <p className="text-xs text-muted">{booking.guestEmail}</p>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(booking.checkIn)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(booking.checkOut)}</td>
                <td className="px-4 py-3 text-muted">{booking.roomName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {booking.totalPrice.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center items-center gap-2 relative">
                    <button
                      aria-label="View Details"
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button
                      aria-label="Edit Booking"
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <div className="relative">
                      <button
                        aria-label="More Actions"
                        onClick={() => handleToggleMenu(booking.id)}
                        className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                      </button>
                      {actionMenuOpen === booking.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-primary/10 py-1 z-10">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/5 text-success"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'checked-in')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/5 text-primary"
                            >
                              Check-in
                            </button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-action/5 text-action"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-muted mb-2">calendar_month</span>
          <p className="text-muted">No bookings found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-primary/10 bg-white px-4 py-3">
          <p className="text-sm text-muted">
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center rounded-lg h-8 px-3 bg-white border border-primary/10 text-foreground text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center rounded-lg h-8 px-3 bg-white border border-primary/10 text-foreground text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(BookingTable);
