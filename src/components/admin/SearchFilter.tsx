'use client';

import React from 'react';

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  placeholder?: string;
  showStatusFilter?: boolean;
}

export default function SearchFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  placeholder = 'Search...',
  showStatusFilter = true,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
        />
      </div>

      {/* Status Filter */}
      {showStatusFilter && onStatusChange && (
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-primary/10 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-medium bg-white min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )}
    </div>
  );
}