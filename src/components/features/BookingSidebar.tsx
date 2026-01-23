'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const SEARCH_PARAMS_KEY = 'stayeasy_search_params';

interface BookingSidebarProps {
  room: {
    _id: string;
    id: string;
    name: string;
    price: number;
    capacity: number;
  };
}

interface SavedSearchParams {
  checkIn: string | null;
  checkOut: string | null;
  guests: string | null;
}

export default function BookingSidebar({ room }: BookingSidebarProps) {
  const searchParams = useSearchParams();

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<string>('1');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from URL first, then fallback to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Priority 1: URL params
      const urlCheckIn = searchParams.get('checkIn');
      const urlCheckOut = searchParams.get('checkOut');
      const urlGuests = searchParams.get('guests');

      if (urlCheckIn) {
        setCheckIn(new Date(urlCheckIn));
      }
      if (urlCheckOut) {
        setCheckOut(new Date(urlCheckOut));
      }
      if (urlGuests) {
        setGuests(urlGuests);
      }

      // Priority 2: sessionStorage (only if URL params not present)
      if (!urlCheckIn || !urlCheckOut || !urlGuests) {
        const saved = sessionStorage.getItem(SEARCH_PARAMS_KEY);
        if (saved) {
          try {
            const params: SavedSearchParams = JSON.parse(saved);
            if (!urlCheckIn && params.checkIn) {
              setCheckIn(new Date(params.checkIn));
            }
            if (!urlCheckOut && params.checkOut) {
              setCheckOut(new Date(params.checkOut));
            }
            if (!urlGuests && params.guests) {
              setGuests(params.guests);
            }
          } catch (e) {
            console.error('Failed to load search params:', e);
          }
        }
      }

      setIsLoaded(true);
    }
  }, [searchParams]);

  // Calculate nights and total
  const nights = checkIn && checkOut
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 4; // Default to 4 nights

  const subtotal = room.price * (nights > 0 ? nights : 4);
  const cleaningFee = 150000;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + cleaningFee + serviceFee;

  // Build query params for booking page
  const getBookingUrl = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    if (guests) params.set('guests', guests);
    const query = params.toString();
    return `/rooms/${room._id}/book${query ? `?${query}` : ''}`;
  };

  

  if (!isLoaded) {
    return (
      <div className="sticky top-28">
        <div className="bg-white border border-primary/10 rounded-xl p-6 shadow-xl shadow-primary/5 animate-pulse">
          <div className="h-8 bg-primary/10 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-primary/10 rounded mb-4"></div>
          <div className="h-12 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-28">
      <style jsx global>{`
        .booking-datepicker {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: var(--color-primary, #1a1a2e) !important;
          cursor: pointer !important;
          padding: 0 !important;
        }
        .booking-datepicker::placeholder {
          color: rgba(26, 26, 46, 0.4) !important;
        }
        .booking-datepicker-wrapper {
          width: 100% !important;
        }
        .booking-datepicker-input-container {
          width: 100% !important;
        }
        .react-datepicker-popper {
          z-index: 50 !important;
        }
        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid rgba(26, 26, 46, 0.1) !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px -12px rgba(26, 26, 46, 0.15) !important;
        }
        .react-datepicker__header {
          background: white !important;
          border-bottom: 1px solid rgba(26, 26, 46, 0.05) !important;
          border-radius: 1rem 1rem 0 0 !important;
        }
        .react-datepicker__current-month {
          font-weight: 900 !important;
          color: #1a1a2e !important;
        }
        .react-datepicker__day-name {
          color: rgba(26, 26, 46, 0.4) !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day {
          color: #1a1a2e !important;
          font-weight: 700 !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__day:hover {
          background: rgba(26, 26, 46, 0.05) !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #1a1a2e !important;
          color: white !important;
        }
        .react-datepicker__day--disabled {
          color: rgba(26, 26, 46, 0.2) !important;
        }
      `}</style>
      <div className="bg-white border border-primary/10 rounded-xl p-6 shadow-xl shadow-primary/5">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">
            {room.price.toLocaleString('vi-VN')}đ
          </p>
          <p className="opacity-80">/ đêm</p>
        </div>

        {/* Date Inputs */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-primary/20 rounded-lg overflow-hidden">
          <div className="p-3 bg-white">
            <label className="block text-xs font-bold uppercase tracking-wider opacity-60">
              Nhận phòng
            </label>
            <div className="booking-datepicker-wrapper">
              <DatePicker
                selected={checkIn}
                onChange={(date: Date | null) => setCheckIn(date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                placeholderText="Chọn ngày"
                dateFormat="dd/MM/yyyy"
                className="booking-datepicker"
                wrapperClassName="booking-datepicker-input-container"
                locale={vi}
              />
            </div>
          </div>
          <div className="p-3 bg-white">
            <label className="block text-xs font-bold uppercase tracking-wider opacity-60">
              Trả phòng
            </label>
            <div className="booking-datepicker-wrapper">
              <DatePicker
                selected={checkOut}
                onChange={(date: Date | null) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                placeholderText="Chọn ngày"
                dateFormat="dd/MM/yyyy"
                className="booking-datepicker"
                wrapperClassName="booking-datepicker-input-container"
                locale={vi}
              />
            </div>
          </div>
        </div>

        {/* Guests Select */}
        <div className="mt-px border border-t-0 border-primary/20 rounded-lg rounded-t-none overflow-hidden">
          <div className="p-3 bg-white">
            <label className="block text-xs font-bold uppercase tracking-wider opacity-60">
              Số khách
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full border-none p-0 mt-1 font-medium bg-transparent focus:ring-0 appearance-none"
            >
              {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} khách
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reserve Button */}
        <Link
          href={getBookingUrl()}
          className="w-full mt-6 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-action text-white text-base font-bold hover:opacity-90 transition-opacity"
        >
          <span className="truncate">Đặt phòng</span>
        </Link>
        <p className="text-center text-sm mt-4 opacity-60">
          Bạn chưa bị trừ tiền
        </p>

        {/* Price Breakdown */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between opacity-80">
            <span>{room.price.toLocaleString('vi-VN')}đ x {nights > 0 ? nights : 4} đêm</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between opacity-80">
            <span>Phí dọn dẹp</span>
            <span>{cleaningFee.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between opacity-80">
            <span>Phí dịch vụ</span>
            <span>{serviceFee.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between font-bold">
          <span>Tổng cộng</span>
          <span>{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );
}
