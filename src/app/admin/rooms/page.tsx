'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Room } from '@/types/room';
import { RoomTable, RoomModal } from '@/components/admin';

// Pagination config
const ITEMS_PER_PAGE = 10;

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/admin/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Partial<Room>) => {
    try {
      if (selectedRoom) {
        const { data: updatedRoom } = await api.put(
          `/admin/rooms/${selectedRoom.id}`,
          data
        );
        setRooms((prev) =>
          prev.map((r) => (r.id === selectedRoom.id ? updatedRoom : r))
        );
      } else {
        const { data: newRoom } = await api.post('/admin/rooms', data);
        setRooms((prev) => [...prev, newRoom]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save room:', error);
      alert('Failed to save room details. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/rooms/${id}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      await api.put(`/admin/rooms/${id}`, { available });
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, available } : r))
      );
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  // Filter rooms by search
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-foreground text-3xl font-bold leading-tight">
          Manage Rooms
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="truncate">Add New Room</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary/10 dark:border-primary/20 bg-white text-foreground placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <RoomTable
        rooms={paginatedRooms}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleAvailability={handleToggleAvailability}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-primary/5 dark:hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>

            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`text-sm font-medium leading-normal flex size-9 items-center justify-center rounded-lg transition-colors ${
                    currentPage === page
                      ? 'text-white bg-primary font-bold'
                      : 'text-muted hover:bg-primary/5 dark:hover:bg-primary/10'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={idx}
                  className="text-sm font-medium leading-normal flex size-9 items-center justify-center text-muted"
                >
                  ...
                </span>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-primary/5 dark:hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        room={selectedRoom}
        title={selectedRoom ? 'Edit Room' : 'Add New Room'}
      />
    </div>
  );
}
