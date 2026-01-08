import React from 'react';
import { Room } from '@/types/room';
import RoomCard from './RoomCard';

interface RoomGridProps {
  rooms: Room[];
  isLoading?: boolean;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-primary/5 animate-pulse">
            <div className="h-56 md:h-64 bg-primary/5" />
            <div className="p-6 space-y-4">
              <div className="h-8 bg-primary/5 rounded-xl w-3/4" />
              <div className="h-6 bg-primary/5 rounded-xl w-1/2" />
              <div className="h-12 bg-primary/5 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-primary/10 shadow-xl shadow-primary/5">
        <div className="text-primary/10 mb-8">
          <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-4">No rooms found</h3>
        <p className="text-primary/40 font-medium max-w-xs mx-auto">Try adjusting your filters to find what you&apos;re looking for.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room._id || room.id} room={room} />
      ))}
    </div>
  );
};

export default RoomGrid;