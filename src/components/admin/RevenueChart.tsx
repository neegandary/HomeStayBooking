'use client';

import React from 'react';

interface RevenueData {
  day: string;
  value: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  subtitle?: string;
}

export default function RevenueChart({
  data,
  title = 'Weekly Revenue',
  subtitle = 'Revenue in VND',
}: RevenueChartProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-primary">{title}</h3>
          <p className="text-xs text-primary/40 font-bold uppercase tracking-widest">
            {subtitle}
          </p>
        </div>
        <select className="bg-primary/5 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-primary p-2 focus:ring-primary/10">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="w-full relative flex items-end justify-center h-full">
              <div
                className="w-full max-w-[40px] bg-primary rounded-t-xl transition-all duration-500 group-hover:bg-primary/80"
                style={{ height: `${item.value}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {(item.value * 100000).toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
            <span className="text-[10px] text-primary/40 font-black uppercase tracking-widest">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
