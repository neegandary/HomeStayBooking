import React from 'react';
import Link from 'next/link';
import { Room } from '@/types/room';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] border border-gray-100 flex flex-col h-full">
      {/* Thumbnail Carousel */}
      <div className="h-48 md:h-56 relative">
        <ImageCarousel
          images={room.images}
          autoplay={false}
          showPagination={true}
          showNavigation={false}
          className="h-full"
        />
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-800 shadow-sm">
          {room.capacity} Guests
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{room.name}</h3>
          <span className="text-primary font-bold text-lg">${room.price}<span className="text-gray-500 text-sm font-normal">/night</span></span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-gray-400 text-[10px] py-1">+{room.amenities.length - 3} more</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/rooms/${room.id}`}
            className="flex-1 text-center py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Details
          </Link>
          <Link
            href={`/rooms/${room.id}/book`}
            className="flex-1 text-center py-2 px-4 rounded-lg bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;