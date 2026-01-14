'use client';

import React from 'react';

const features = [
  {
    icon: 'spark',
    title: 'Unique Properties',
    description: 'Every homestay is handpicked for its unique character and quality.',
  },
  {
    icon: 'headset_mic',
    title: '24/7 Support',
    description: 'Our dedicated team is always here to help, anytime you need.',
  },
  {
    icon: 'verified',
    title: 'Best Price Guarantee',
    description: 'We ensure you get the best value for your stay, without any hidden fees.',
  },
];

const FeatureCards = () => {
  return (
    <section className="flex flex-col gap-10 px-4 py-20 @container">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-primary text-3xl font-black uppercase tracking-tight sm:text-4xl max-w-[720px]">
            THE STAYEASY DIFFERENCE
          </h1>
          <p className="text-primary/70 text-base font-normal leading-normal max-w-[720px]">
            Discover why booking with us makes your travel experience seamless and memorable.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-1 gap-4 rounded-2xl border border-primary/10 bg-white p-6 flex-col shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow"
            >
              <span className="material-symbols-outlined text-action text-3xl">
                {feature.icon}
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-primary text-lg font-bold leading-tight">
                  {feature.title}
                </h2>
                <p className="text-muted text-sm font-normal leading-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
