'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingService } from '@/lib/bookingService';
import { Booking } from '@/types/booking';
import { Room } from '@/types/room';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

// QR code expiration time in seconds (5 minutes)
const QR_EXPIRATION_TIME = 5 * 60;

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRATION_TIME);

  // Check for error from VNPay redirect
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const codeParam = searchParams.get('code');
    if (errorParam) {
      setError(`Payment failed: ${errorParam}${codeParam ? ` (Code: ${codeParam})` : ''}`);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookingService.getById(id);
        const bookingData = response.data;
        setBooking(bookingData);

        // Fetch room from API if roomId exists
        if (bookingData.roomId) {
          const roomResponse = await fetch(`/api/rooms/${bookingData.roomId}`);
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            setRoom(roomData);
          }
        }

        // If already confirmed, redirect to confirmation page
        if (bookingData.status === 'confirmed') {
          router.push(`/booking/${id}`);
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  }, []);

  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${id}/pay`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const data = await response.json();

      // Redirect to VNPay or confirmation
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/booking/${id}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSaveQR = () => {
    if (!booking?.paymentInfo?.qrUrl) return;

    const link = document.createElement('a');
    link.href = booking.paymentInfo.qrUrl;
    link.download = `payment-qr-${booking.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">Không tìm thấy đặt phòng</h1>
        <button onClick={() => router.back()} className="text-primary font-bold text-sm hover:underline">Quay lại</button>
      </div>
    );
  }

  const time = formatTime(timeLeft);
  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-4xl flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight">Hoàn tất thanh toán</h1>
            <p className="text-base font-normal opacity-50">Mã đặt phòng #{booking.id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left: How to Pay */}
            <div className="flex flex-col gap-6 rounded-xl border border-primary/10 bg-primary/[0.02] p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">Hướng dẫn thanh toán</h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="font-bold">1</span>
                    </div>
                    <p className="text-sm opacity-70">Mở ứng dụng ngân hàng hoặc ví điện tử hỗ trợ VietQR.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="font-bold">2</span>
                    </div>
                    <p className="text-sm opacity-70">Chọn tính năng Quét mã QR và quét mã bên phải.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="font-bold">3</span>
                    </div>
                    <p className="text-sm opacity-70">Ktra số tiền và thông tin người nhận, sau đó xác nhận thanh toán.</p>
                  </li>
                </ul>
              </div>

              {/* Room Info */}
              <div className="flex items-center gap-4 rounded-lg bg-white p-4 border border-primary/5">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-primary/5">
                  {room.images?.[0] && (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{room.name}</p>
                  <p className="text-xs opacity-50">{booking.checkIn} - {booking.checkOut}</p>
                  <p className="text-xs opacity-50">{booking.guests} {booking.guests === 1 ? 'khách' : 'khách'}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="mt-auto flex flex-col gap-4">
                <button
                  onClick={handlePaymentComplete}
                  disabled={isProcessing || isExpired}
                  className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white gap-2 text-sm font-bold tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span className="truncate">Tôi đã hoàn tất thanh toán</span>
                  )}
                </button>
                <a className="text-center text-sm font-medium text-primary hover:underline cursor-pointer" href="mailto:support@stayeasy.com">
                  Gặp sự cố? Liên hệ hỗ trợ
                </a>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center rounded-xl border border-primary/10 bg-white p-6 shadow-lg">
              {/* Amount */}
              <div className="flex w-full flex-col items-center gap-4 border-b border-primary/10 pb-6">
                <p className="text-base font-medium opacity-50">Tổng số tiền cần thanh toán</p>
                <p className="text-4xl font-extrabold">{booking.totalPrice.toLocaleString('vi-VN')} VND</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 py-6">
                <div className={`w-56 h-56 rounded-lg bg-primary/5 p-2 ${isExpired ? 'opacity-30' : ''}`}>
                  {booking.paymentInfo?.qrUrl ? (
                    <Image
                      src={booking.paymentInfo.qrUrl}
                      alt="Mã thanh toán VietQR"
                      width={224}
                      height={224}
                      className="h-full w-full rounded-md object-contain"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl opacity-30">qr_code_2</span>
                    </div>
                  )}
                </div>
                <p className="max-w-xs text-center text-sm opacity-50">
                  Quét để thanh toán bằng bất kỳ ứng dụng ngân hàng nào hỗ trợ VietQR/VNPay.
                </p>
              </div>

              {/* Timer */}
              <div className="flex w-full flex-col gap-2 border-t border-primary/10 pt-6 text-center">
                <p className="text-sm opacity-50">
                  {isExpired ? 'Mã QR đã hết hạn' : 'Mã QR hết hạn sau:'}
                </p>
                {!isExpired && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex w-16 flex-col items-center">
                      <div className="flex h-12 w-full items-center justify-center rounded-lg bg-primary/5">
                        <p className="text-lg font-bold text-primary">{time.hours}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">:</span>
                    <div className="flex w-16 flex-col items-center">
                      <div className="flex h-12 w-full items-center justify-center rounded-lg bg-primary/5">
                        <p className="text-lg font-bold text-primary">{time.minutes}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">:</span>
                    <div className="flex w-16 flex-col items-center">
                      <div className="flex h-12 w-full items-center justify-center rounded-lg bg-primary/5">
                        <p className="text-lg font-bold text-primary">{time.seconds}</p>
                      </div>
                    </div>
                  </div>
                )}
                {isExpired && (
                  <button
                    onClick={() => setTimeLeft(QR_EXPIRATION_TIME)}
                    className="mt-2 text-sm font-bold text-primary hover:underline"
                  >
                    Làm mới mã QR
                  </button>
                )}
              </div>

              {/* Save QR Button */}
              {booking.paymentInfo?.qrUrl && (
                <div className="mt-6 flex w-full">
                  <button
                    onClick={handleSaveQR}
                    className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/5 gap-2 text-sm font-bold tracking-wide hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span className="truncate">Lưu mã QR</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex w-full max-w-lg items-center justify-center gap-3 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <span className="material-symbols-outlined text-yellow-600">shield</span>
            <p className="text-sm text-yellow-800">Vì sự an toàn của bạn, không chia sẻ trang thanh toán này với bất kỳ ai.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
