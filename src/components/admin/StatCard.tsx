'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  change,
  isPositive,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
          {icon}
        </div>
        <div
          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-black text-primary mt-1">{value}</h3>
      </div>
    </div>
  );
}