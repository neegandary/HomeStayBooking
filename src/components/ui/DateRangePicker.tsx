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
    <div className="flex flex-col space-y-2 w-full">
      <style jsx global>{`
        .react-datepicker {
          display: flex !important;
          flex-direction: row !important;
          width: 100% !important;
          justify-content: center !important;
          gap: 0.5rem;
        }
        .react-datepicker__month-container {
          float: none !important;
          flex: 0 1 auto !important;
        }
        .react-datepicker__day-name,
        .react-datepicker__day {
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.1rem !important;
        }
        .react-datepicker__current-month {
          font-size: 0.9rem !important;
        }
        @media (max-width: 500px) {
          .react-datepicker {
            flex-direction: column !important;
          }
        }
      `}</style>
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
        className="rounded-3xl border-none shadow-none"
        calendarClassName="!border-none !font-sans !bg-transparent"
        dayClassName={(date) =>
          isBefore(date, startOfDay(new Date())) ? "text-primary/10" : "text-primary font-bold hover:bg-primary/5 rounded-xl transition-colors"
        }
      />
      <div className="flex justify-between p-6 bg-primary/5 rounded-2xl border border-primary/5 mt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-1">Check-in</span>
          <span className="text-sm font-black text-primary">{checkIn || 'Select date'}</span>
        </div>
        <div className="w-px h-10 bg-primary/10 mx-6" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-1">Check-out</span>
          <span className="text-sm font-black text-primary">{checkOut || 'Select date'}</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;