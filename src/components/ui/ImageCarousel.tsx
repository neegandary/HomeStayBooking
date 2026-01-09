'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  images: string[];
  autoplay?: boolean;
  className?: string;
  showPagination?: boolean;
}

export function ImageCarousel({
  images,
  autoplay = true,
  className = '',
  showPagination = true
}: ImageCarouselProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    if (swiper && swiper.autoplay) {
      if (autoplay) {
        swiper.autoplay.start();
      } else {
        swiper.autoplay.stop();
      }
    }
  }, [autoplay, swiper]);

  // Only enable loop if there are enough slides (minimum 3 for loop to work properly)
  const enableLoop = images.length >= 3;

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      pagination={showPagination ? { clickable: true } : false}
      autoplay={
        autoplay
          ? {
            delay: 2500,
            disableOnInteraction: false,
          }
          : false
      }
      loop={enableLoop}
      onSwiper={setSwiper}
      className={`w-full h-full ${className}`}
    >
      {images.map((src, i) => (
        <SwiperSlide key={i}>
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={`Slide ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}