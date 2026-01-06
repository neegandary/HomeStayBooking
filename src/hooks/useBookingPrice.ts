import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';

export function useBookingPrice(
  pricePerNight: number,
  checkIn: string | null,
  checkOut: string | null
) {
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const start = parseISO(checkIn);
      const end = parseISO(checkOut);
      const diff = differenceInDays(end, start);
      return diff > 0 ? diff : 0;
    } catch (e) {
      return 0;
    }
  }, [checkIn, checkOut]);

  const subtotal = nights * pricePerNight;
  const cleaningFee = 35;
  const serviceFee = subtotal * 0.1; // 10% fee
  const total = subtotal + cleaningFee + serviceFee;

  return {
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    total: nights > 0 ? total : 0,
  };
}