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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/5 bg-primary/[0.02]">
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Room
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Price
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Capacity
              </th>
              <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Status
              </th>
              <th className="text-right px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-primary/5 last:border-0 hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0 relative">
                      {room.images[0] && (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{room.name}</p>
                      <p className="text-xs text-primary/60 truncate max-w-[200px]">
                        {room.amenities.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-primary">{room.price.toLocaleString('vi-VN')}đ</p>
                  <p className="text-xs text-primary/60">per night</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-primary/80">{room.capacity} guests</p>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => room.id && onToggleAvailability(room.id, !room.available)}
                    className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      room.available
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {room.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(room)}
                      className="p-2 rounded-lg hover:bg-primary/5 text-primary/60 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {deleteConfirm === room.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (room.id) onDelete(room.id);
                            setDeleteConfirm(null);
                          }}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Confirm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(room.id ?? null)}
                        className="p-2 rounded-lg hover:bg-red-50 text-primary/60 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
        <div className="p-12 text-center">
          <p className="text-primary/60">No rooms found.</p>
        </div>
      )}
    </div>
  );
}