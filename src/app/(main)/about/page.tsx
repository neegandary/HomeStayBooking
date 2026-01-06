import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-3xl text-center">
        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">
          Tuần 1: Tạo các trang đơn giản
        </span>
        <h1 className="text-4xl md:text-7xl font-black text-primary mb-10 tracking-tight uppercase">
          About StayEasy
        </h1>
        <div className="w-20 h-2 bg-action mx-auto mb-12 rounded-full" />
        <p className="text-xl text-primary/60 font-medium leading-relaxed mb-12">
          StayEasy is a modern homestay booking platform built with Next.js 15,
          focusing on user experience, high-performance animations, and secure authentication.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/5">
            <h3 className="text-lg font-black text-primary mb-4 uppercase tracking-tight">Our Mission</h3>
            <p className="text-primary/50 text-sm font-medium leading-relaxed">
              To provide the most seamless and beautiful booking experience for travelers and hosts alike.
            </p>
          </div>
          <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/5">
            <h3 className="text-lg font-black text-primary mb-4 uppercase tracking-tight">Tech Stack</h3>
            <p className="text-primary/50 text-sm font-medium leading-relaxed">
              Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and Swiper.js for the ultimate modern web experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
