'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isBefore, startOfDay } from 'date-fns';

interface DateRangePickerProps {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (dates: { checkIn: string | null; checkOut: string | null }) => void;
  excludeDates?: string[];
  maxGuests?: number;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  excludeDates = [],
}) => {
  const startDate = checkIn ? new Date(checkIn) : null;
  const endDate = checkOut ? new Date(checkOut) : null;

  const excluded = excludeDates.map(date => startOfDay(new Date(date)));

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    onChange({
      checkIn: start ? format(start, 'yyyy-MM-dd') : null,
      checkOut: end ? format(end, 'yyyy-MM-dd') : null,
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        minDate={new Date()}
        excludeDates={excluded}
        isClearable
        inline
        monthsShown={2}
        className="rounded-xl border border-gray-100 shadow-sm"
        calendarClassName="!border-none !font-sans"
        dayClassName={(date) =>
          isBefore(date, startOfDay(new Date())) ? "text-gray-300" : "text-gray-700 hover:bg-zinc-100 rounded-full"
        }
      />
      <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-in</span>
          <span className="text-sm font-bold text-gray-900">{checkIn || 'Select date'}</span>
        </div>
        <div className="w-px h-8 bg-gray-200 mx-4" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-out</span>
          <span className="text-sm font-bold text-gray-900">{checkOut || 'Select date'}</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;