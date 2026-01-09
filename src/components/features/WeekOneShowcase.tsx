'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const destinations = [
  {
    id: 1,
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Tropical paradise with lush green landscapes.',
  },
  {
    id: 2,
    name: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    description: 'Stunning white buildings and blue domes.',
  },
  {
    id: 3,
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional temples and beautiful zen gardens.',
  },
  {
    id: 4,
    name: 'Swiss Alps, Switzerland',
    image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80',
    description: 'Majestic mountains and luxury ski resorts.',
  },
  {
    id: 5,
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The city of lights, love, and fine dining.',
  },
];

const WeekOneShowcase = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-primary tracking-tight uppercase">
            Top Destinations
          </h2>
          <div className="w-20 h-2 bg-action mx-auto mt-6 rounded-full" />
        </div>

        <div className="w-full">
          <Swiper
            modules={[Pagination, Autoplay]}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            spaceBetween={40}
            loop={destinations.length >= 4}
            loopAdditionalSlides={2}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            className="w-full py-12"
          >
            {destinations.map((destination) => (
              <SwiperSlide key={destination.id} className="w-[80vw] max-w-[500px]">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-[2rem] overflow-hidden group shadow-2xl shadow-primary/10">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 768px) 80vw, 500px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                      {destination.name}
                    </h3>
                    <p className="text-white/70 text-sm font-medium leading-relaxed">
                      {destination.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #000;
          opacity: 0.1;
        }
        .swiper-pagination-bullet-active {
          background: #FF5A5F;
          opacity: 1;
          width: 32px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
};

export default WeekOneShowcase;
