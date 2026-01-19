'use client';

import React, { useState, memo } from 'react';
import Link from 'next/link';
import { Room } from '@/types/room';
import dynamic from 'next/dynamic';

// Use next/dynamic with SSR disabled for heavy carousel component
// Note: .then(mod => mod.ImageCarousel) is required for named exports
const ImageCarousel = dynamic(
  () => import('@/components/ui/ImageCarousel').then(mod => mod.ImageCarousel),
  {
    ssr: false,
    loading: () => <div className="h-56 md:h-64 bg-primary/5 animate-pulse" />
  }
);

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = memo(({ room }) => {
  const [isHovered, setIsHovered] = useState(false);
  const roomId = room._id || room.id;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 border border-primary/5 flex flex-col h-full group relative focus-within:ring-2 focus-within:ring-secondary/50"
    >
      {/* Thumbnail Carousel */}
      <div className="h-56 md:h-64 relative overflow-hidden group/carousel">
        <ImageCarousel
          images={room.images}
          autoplay={isHovered}
          showPagination={true}
          className="h-full transition-transform duration-500 group-hover:scale-110 [&_.swiper-pagination]:z-30 [&_.swiper-pagination]:relative"
        />
        <div className="absolute top-4 right-4 z-10 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-black/10">
          {room.capacity} Khách
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-black text-primary tracking-tight line-clamp-1 group-hover:text-secondary transition-colors">
            <Link href={`/rooms/${roomId}`} className="after:absolute after:inset-0 after:z-20">
              {room.name}
            </Link>
          </h3>
        </div>

        <div className="mb-4">
          <span className="text-secondary font-black text-2xl">{room.price.toLocaleString('vi-VN')}đ</span>
          <span className="text-primary/40 text-xs font-bold uppercase tracking-widest ml-2">/ đêm</span>
        </div>

        <p className="text-primary/60 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="bg-primary/5 text-primary/60 text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-widest font-black border border-primary/5">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-primary/30 text-[9px] font-black uppercase tracking-widest py-1">+{room.amenities.length - 3} nữa</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto relative z-30">
          <Link
            href={`/rooms/${roomId}`}
            tabIndex={-1}
            aria-hidden="true"
            className="flex-1 text-center py-3 px-4 rounded-xl border-2 border-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all active:scale-[0.98]"
          >
            Chi tiết
          </Link>
          <Link
            href={`/rooms/${roomId}/book`}
            className="flex-1 text-center py-3 px-4 rounded-xl bg-action text-white font-black text-xs uppercase tracking-widest hover:bg-tiger-orange transition-all shadow-lg shadow-action/20 active:scale-[0.98]"
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </div>
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;