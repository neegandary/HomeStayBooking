'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { bookingService } from '@/lib/bookingService';
import { vnpay } from '@/lib/vnpay';
import { Booking } from '@/types/booking';
import { Room } from '@/types/room';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

// Status configurations
const statusConfig: Record<string, { bg: string; title: string; message: string; icon: string }> = {
  pending: {
    bg: 'bg-yellow-500',
    title: 'Chờ thanh toán',
    message: 'Vui lòng hoàn tất thanh toán để xác nhận đặt phòng.',
    icon: 'pending',
  },
  confirmed: {
    bg: 'bg-secondary',
    title: 'Đặt phòng đã xác nhận!',
    message: 'Chúng tôi đã gửi email xác nhận đến {email}.',
    icon: 'check_circle',
  },
  'checked-in': {
    bg: 'bg-green-600',
    title: 'Đã nhận phòng!',
    message: 'Chúc bạn có kỳ nghỉ tuyệt vời!',
    icon: 'login',
  },
  completed: {
    bg: 'bg-primary',
    title: 'Đã hoàn thành',
    message: 'Cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!',
    icon: 'verified',
  },
  cancelled: {
    bg: 'bg-red-500',
    title: 'Đã hủy',
    message: 'Đặt phòng này đã bị hủy.',
    icon: 'cancel',
  },
};

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await bookingService.getById(id);
        setBooking(response.data);

        if (response.data.roomId) {
          const roomResponse = await fetch(`/api/rooms/${response.data.roomId}`);
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            setRoom(roomData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle payment for pending bookings
  const handlePayment = async () => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const paymentUrl = vnpay.createPaymentUrl({
        bookingId: booking.id,
        amount: booking.totalPrice,
        orderInfo: `Thanh toan dat phong ${room?.name || 'phong'}`,
        ipAddr: '127.0.0.1',
      });
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light px-4 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Không tìm thấy đặt phòng</h1>
        <Link href="/rooms" className="text-primary font-medium text-sm hover:underline">
          Quay lại tìm phòng
        </Link>
      </div>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const status = statusConfig[booking.status] || statusConfig.pending;
  const showQRCode = ['confirmed', 'checked-in'].includes(booking.status);

  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div className="flex flex-col max-w-[960px] flex-1">
          {/* Main Content */}
          <main className="flex flex-col gap-8 py-8 md:py-12 px-4">
            {/* Status Banner */}
            <div className={`${status.bg} rounded-lg p-6 text-center`}>
              <span className="material-symbols-outlined text-4xl text-white mb-2 block">
                {status.icon}
              </span>
              <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">
                {status.title}
              </h1>
              <p className="text-white/90 text-base font-normal leading-normal pt-2">
                {status.message.replace('{email}', booking.guestEmail || 'email của bạn')}
              </p>
               {/* Payment Button for Pending */}
            {booking.status === 'pending' && (
              <div className=" p-6 text-center">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-action text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                </button>
              </div>
            )}
            </div>

           

            {/* Grid: QR Code + Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* QR Code Section - Only show for confirmed/checked-in */}
              {showQRCode && (
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
                    <p className="text-lg font-bold leading-tight tracking-tight">
                      Mã QR nhận phòng
                    </p>
                    <div className="bg-action p-4 rounded-lg mt-4 w-full max-w-[200px] aspect-square flex items-center justify-center">
                      <div className="bg-white p-2 rounded">
                        <QRCodeSVG
                          value={JSON.stringify({
                            type: 'CHECKIN',
                            bookingId: booking.id,
                            roomId: booking.roomId,
                            checkIn: booking.checkIn,
                            checkOut: booking.checkOut,
                            guests: booking.guests,
                          })}
                          size={160}
                          level="M"
                        />
                      </div>
                    </div>
                    <p className="text-sm font-normal leading-normal mt-4 opacity-60">
                      Xuất trình mã này tại quầy lễ tân để nhận phòng nhanh chóng.
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Details Section */}
              <div className={showQRCode ? 'md:col-span-2' : 'md:col-span-3'}>
                <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className="px-6 pt-6 pb-4 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-[22px] font-bold leading-tight tracking-tight">
                      Chi tiết đặt phòng
                    </h2>
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'pending' ? 'Chờ thanh toán' :
                       booking.status === 'confirmed' ? 'Đã xác nhận' :
                       booking.status === 'checked-in' ? 'Đã nhận phòng' :
                       booking.status === 'completed' ? 'Hoàn thành' :
                       'Đã hủy'}
                    </span>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Stay Details */}
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined mt-1 opacity-70">king_bed</span>
                      <div>
                        <p className="text-sm font-medium opacity-50">Nơi ở</p>
                        <p className="text-base font-bold">{room.name}</p>
                        <p className="text-sm opacity-70">{room.description?.slice(0, 50)}...</p>
                        <p className="text-sm opacity-70 mt-1">Tối đa {room.capacity} khách</p>
                      </div>
                    </div>

                    {/* Guest Info */}
                    {(booking.guestName || booking.guestEmail || booking.guestPhone) && (
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined mt-1 opacity-70">person</span>
                        <div>
                          <p className="text-sm font-medium opacity-50">Khách</p>
                          {booking.guestName && (
                            <p className="text-base font-bold">{booking.guestName}</p>
                          )}
                          {booking.guestEmail && (
                            <p className="text-sm opacity-70">{booking.guestEmail}</p>
                          )}
                          {booking.guestPhone && (
                            <p className="text-sm opacity-70">{booking.guestPhone}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dates & Guests */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined mt-1 opacity-70">calendar_month</span>
                        <div>
                          <p className="text-sm font-medium opacity-50">Nhận phòng</p>
                          <p className="text-base font-bold">{formatDate(booking.checkIn)}</p>
                          <p className="text-sm opacity-70">Từ 15:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined mt-1 opacity-70">event</span>
                        <div>
                          <p className="text-sm font-medium opacity-50">Trả phòng</p>
                          <p className="text-base font-bold">{formatDate(booking.checkOut)}</p>
                          <p className="text-sm opacity-70">Trước 11:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 sm:col-span-2">
                        <span className="material-symbols-outlined mt-1 opacity-70">group</span>
                        <div>
                          <p className="text-sm font-medium opacity-50">Số khách</p>
                          <p className="text-base font-bold">
                            {booking.guests} Khách
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined mt-1 opacity-70">note</span>
                        <div>
                          <p className="text-sm font-medium opacity-50">Yêu cầu đặc biệt</p>
                          <p className="text-sm opacity-80 bg-action/5 p-3 rounded-lg mt-1">
                            {booking.specialRequests}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="border-t border-primary/10 pt-6">
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined mt-1 opacity-70">receipt_long</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium opacity-50">Tóm tắt giá</p>
                          <div className="mt-2 space-y-1 text-sm opacity-70">
                            <div className="flex justify-between">
                              <span>{nights} Đêm</span>
                              <span>{booking.totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                          <div className="flex justify-between mt-4 border-t border-primary/10 pt-2">
                            <p className="font-bold text-base">Tổng cộng</p>
                            <p className="font-bold text-base">{booking.totalPrice.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-colors"
              >
                <span className="truncate">Xem đặt phòng của tôi</span>
              </Link>
              <Link
                href="/"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary/5 text-sm font-bold tracking-wide hover:bg-primary/10 transition-colors"
              >
                <span className="truncate">Về trang chủ</span>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
