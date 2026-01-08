'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Room } from '@/types/room';
import { RoomTable, SearchFilter, RoomModal } from '@/components/admin';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
        // Update existing room
        const { data: updatedRoom } = await api.put(
          `/admin/rooms/${selectedRoom.id}`,
          data
        );
        setRooms((prev) =>
          prev.map((r) => (r.id === selectedRoom.id ? updatedRoom : r))
        );
      } else {
        // Create new room
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

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            Room Management
          </h1>
          <p className="text-primary/60 mt-1">
            Manage your property listings and availability.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Room
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          placeholder="Search rooms..."
          showStatusFilter={false}
        />
      </div>

      {/* Table */}
      <RoomTable
        rooms={filteredRooms}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleAvailability={handleToggleAvailability}
      />

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