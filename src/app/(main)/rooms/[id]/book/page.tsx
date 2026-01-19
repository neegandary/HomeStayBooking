'use client';

import React, { useEffect, useState, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Room } from '@/types/room';
import { BookingFormData } from '@/types/booking';
import { bookingService } from '@/lib/bookingService';
import { useAuth } from '@/hooks/useAuth';
import { useBookingPrice } from '@/hooks/useBookingPrice';

// Use next/dynamic for code splitting heavy components
const DateRangePicker = dynamic(
  () => import('@/components/ui/DateRangePicker'),
  { loading: () => <div className="h-64 bg-primary/5 animate-pulse rounded-xl" /> }
);
const PromoCodeInput = dynamic(
  () => import('@/components/features/PromoCodeInput'),
  { loading: () => <div className="h-20 bg-primary/5 animate-pulse rounded-xl" /> }
);

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    roomId: id,
    checkIn: null,
    checkOut: null,
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });

  // Promo code state
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  const { nights, subtotal, cleaningFee, serviceFee, total } = useBookingPrice(
    room?.price || 0,
    formData.checkIn,
    formData.checkOut
  );

  const finalTotal = Math.max(0, total - promoDiscount);

  // Parallel fetch room and availability to avoid waterfall
  useEffect(() => {
    const fetchRoomAndAvailability = async () => {
      try {
        // Start both fetches in parallel
        const [roomRes, availRes] = await Promise.all([
          fetch(`/api/rooms/${id}`),
          bookingService.getAvailability(id)
        ]);

        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoom(roomData);
          setFormData(prev => ({ ...prev, roomId: roomData.id || id }));
          setBookedDates(availRes.data.bookedDates);
        } else {
          router.push('/rooms');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        router.push('/rooms');
      }
    };
    fetchRoomAndAvailability();
  }, [id, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/rooms/${id}/book`);
    }
  }, [authLoading, isAuthenticated, router, id]);

  const handleDateChange = (dates: { checkIn: string | null; checkOut: string | null }) => {
    setFormData(prev => ({ ...prev, ...dates }));
    if (promoCode) {
      setPromoCode(undefined);
      setPromoDiscount(0);
    }
  };

  const handlePromoApply = (data: { code: string; discount: number }) => {
    setPromoCode(data.code);
    setPromoDiscount(data.discount);
  };

  const handlePromoRemove = () => {
    setPromoCode(undefined);
    setPromoDiscount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await bookingService.create({
        ...formData,
        totalPrice: total,
        promoCode,
      });
      router.push(`/payment/${response.data.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto flex-grow px-4 py-12 md:py-16" style={{ color: 'var(--color-primary)' }}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-10">
              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-action">Chi tiết</p>
                  <p className="font-medium opacity-40">Thanh toán</p>
                  <p className="font-medium opacity-40">Xác nhận</p>
                </div>
                <div className="relative h-1 w-full rounded-full bg-primary/10">
                  <div className="absolute left-0 top-0 h-1 rounded-full bg-action" style={{ width: '33%' }}></div>
                </div>
              </div>

              {/* Page Heading */}
              <h1 className="text-4xl font-black leading-tight tracking-tight">Xác nhận và thanh toán</h1>

              {/* Booking Details Section */}
              <div className="space-y-6">
                <h2 className="font-black uppercase tracking-tight">Chi tiết đặt phòng</h2>
                <div className="rounded-lg border border-primary/10 p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="pb-2 text-sm font-medium">Nhận / Trả phòng</p>
                      <div className="flex h-14 w-full items-center rounded-lg border border-primary/20 px-4">
                        <p className="text-base font-normal">
                          {formData.checkIn && formData.checkOut
                            ? `${new Date(formData.checkIn).toLocaleDateString('vi-VN')} - ${new Date(formData.checkOut).toLocaleDateString('vi-VN')}`
                            : 'Chọn ngày bên dưới'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="pb-2 text-sm font-medium">Số khách</p>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                        className="flex h-14 w-full items-center rounded-lg border border-primary/20 bg-transparent px-4 text-base font-normal focus:border-primary focus:outline-none focus:ring-0"
                      >
                        {[...Array(room.capacity)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} khách</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="space-y-6">
                <h2 className="font-black uppercase tracking-tight">Chọn ngày</h2>
                <div className="rounded-lg border border-primary/10 p-4 md:p-6">
                  <DateRangePicker
                    checkIn={formData.checkIn}
                    checkOut={formData.checkOut}
                    onChange={handleDateChange}
                    excludeDates={bookedDates}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <h2 className="font-black uppercase tracking-tight">Thông tin liên hệ</h2>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium">Họ và tên</p>
                    <input
                      type="text"
                      required
                      value={formData.guestName}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      className="h-14 w-full rounded-lg border border-primary/20 bg-transparent p-4 text-base font-normal placeholder:opacity-40 focus:border-primary focus:outline-none focus:ring-0"
                      placeholder="Nhập họ và tên"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col">
                      <p className="pb-2 text-sm font-medium">Email</p>
                      <input
                        type="email"
                        required
                        value={formData.guestEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                        className="h-14 w-full rounded-lg border border-primary/20 bg-transparent p-4 text-base font-normal placeholder:opacity-40 focus:border-primary focus:outline-none focus:ring-0"
                        placeholder="email@example.com"
                      />
                    </label>
                    <label className="flex flex-col">
                      <div className="flex items-center gap-2 pb-2">
                        <p className="text-sm font-medium">Số điện thoại</p>
                        <span className="material-symbols-outlined text-base opacity-50 cursor-help" title="Dùng để xác nhận đặt phòng">help</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.guestPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                        className="h-14 w-full rounded-lg border border-primary/20 bg-transparent p-4 text-base font-normal placeholder:opacity-40 focus:border-primary focus:outline-none focus:ring-0"
                        placeholder="0123 456 789"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium">Yêu cầu đặc biệt (Tùy chọn)</p>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                      className="h-32 w-full rounded-lg border border-primary/20 bg-transparent p-4 text-base font-normal placeholder:opacity-40 focus:border-primary focus:outline-none focus:ring-0 resize-none"
                      placeholder="Cho chúng tôi biết nếu bạn có yêu cầu đặc biệt..."
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="flex flex-col gap-6 rounded-xl border border-primary/10 bg-background-light p-6 shadow-xl shadow-primary/5">
                {/* Room Info */}
                <div className="flex items-start gap-4">
                  {room.images?.[0] ? (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      width={96}
                      height={96}
                      className="aspect-square w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-24 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl opacity-30">image</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm opacity-60">StayEasy</p>
                    <p className="font-bold text-lg">{room.name}</p>
                    <p className="text-sm opacity-60">{room.capacity} khách · {room.amenities?.length || 0} tiện nghi</p>
                  </div>
                </div>

                <hr className="border-primary/10" />

                {/* Price Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl">Chi tiết giá</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <p className="opacity-80">{room.price.toLocaleString('vi-VN')}đ x {nights} đêm</p>
                      <p>{subtotal.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="opacity-80">Phí dọn dẹp</p>
                      <p>{cleaningFee.toLocaleString('vi-VN')}đ</p>
              </div>
                    <div className="flex justify-between">
                      <p className="opacity-80">Phí dịch vụ</p>
                      <p>{serviceFee.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>

                  {/* Promo Code */}
                  {nights > 0 && (
                    <div className="pt-2">
                      <PromoCodeInput
                        orderValue={total}
                        onApply={handlePromoApply}
                        onRemove={handlePromoRemove}
                        appliedCode={promoCode}
                        appliedDiscount={promoDiscount}
                      />
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-success text-sm font-medium">
                      <p>Giảm giá</p>
                      <p>-{promoDiscount.toLocaleString('vi-VN')}đ</p>
                    </div>
                  )}
                </div>

                <hr className="border-primary/10" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">Tổng cộng</p>
                  <p className="text-lg font-bold text-highlight">{finalTotal.toLocaleString('vi-VN')}đ</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || nights === 0}
                  className={`flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-6 text-white text-base font-bold tracking-wide shadow-lg transition-transform hover:scale-[1.02] ${
                    isSubmitting || nights === 0
                      ? 'bg-primary/20 cursor-not-allowed'
                      : 'bg-action shadow-action/30'
                  }`}
                >
                  <span className="truncate">
                    {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                  </span>
                </button>

                <p className="text-center text-xs opacity-60">
                  Bạn chưa bị trừ tiền. Thanh toán an toàn bởi StayEasy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
