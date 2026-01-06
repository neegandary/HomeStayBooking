'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  images: string[];
  autoplay?: boolean;
  className?: string;
  showNavigation?: boolean;
  showPagination?: boolean;
}

export function ImageCarousel({
  images,
  autoplay = true,
  className = '',
  showNavigation = true,
  showPagination = true
}: ImageCarouselProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation={showNavigation}
      pagination={showPagination ? { clickable: true } : false}
      autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
      className={`w-full h-full ${className}`}
    >
      {images.map((src, i) => (
        <SwiperSlide key={i}>
          <div className="relative w-full h-full">
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}