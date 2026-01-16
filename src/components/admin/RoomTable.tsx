'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Room } from '@/types/room';

interface RoomTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
}

export default function RoomTable({
  rooms,
  onEdit,
  onDelete,
  onToggleAvailability,
}: RoomTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get room type based on capacity
  const getRoomType = (capacity: number) => {
    if (capacity <= 1) return 'Single';
    if (capacity <= 2) return 'Double';
    if (capacity <= 4) return 'Suite';
    return 'Family';
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-primary/10  bg-white  shadow-sm">
        <table className="min-w-full divide-y divide-primary/10 ">
          <thead className="bg-primary/[0.02] ">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Room
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Room Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Max Occupancy
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white  divide-y divide-primary/10 ">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-primary/[0.02] ">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/5 dark:bg-primary/20 flex-shrink-0 relative">
                      {room.images[0] && (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {room.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {getRoomType(room.capacity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {room.price.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {room.capacity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => room.id && onToggleAvailability(room.id, !room.available)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      room.available
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-action/10 text-action hover:bg-action/20'
                    }`}
                  >
                    {room.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEdit(room)}
                      className="text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    {deleteConfirm === room.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (room.id) onDelete(room.id);
                            setDeleteConfirm(null);
                          }}
                          className="text-white bg-action hover:bg-action/90 rounded-md p-1 transition-colors"
                          title="Confirm Delete"
                        >
                          <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-foreground bg-primary/10 hover:bg-primary/20 rounded-md p-1 transition-colors"
                          title="Cancel"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(room.id ?? null)}
                        className="text-muted hover:text-action transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rooms.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-background-dark rounded-lg border border-primary/10 dark:border-primary/20">
          <span className="material-symbols-outlined text-4xl text-muted mb-2">bed</span>
          <p className="text-muted">No rooms found.</p>
        </div>
      )}
    </div>
  );
}
