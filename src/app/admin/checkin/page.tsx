'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useAuth } from '@/hooks/useAuth';
import { Booking } from '@/types/booking';

// Extended booking type with populated room data from API
interface BookingWithRoom extends Booking {
  room?: {
    name: string;
    type?: string;
    capacity?: number;
  };
}

interface CheckinData {
  type: string;
  bookingId: string;
  roomId: string;
  guestName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface CheckinResult {
  valid: boolean;
  message?: string;
  error?: string;
  booking?: {
    id: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests?: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    roomId: string;
    roomName?: string;
    status: string;
  };
}

export default function AdminCheckinPage() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<CheckinData | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingWithRoom | null>(null);
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('upload');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBookingDetails = async (bookingId: string) => {
    setIsFetchingDetails(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();
      setBookingDetails(data);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      const decodedText = await html5QrCode.scanFile(file, true);

      try {
        const data = JSON.parse(decodedText) as CheckinData;
        if (data.type === 'CHECKIN' && data.bookingId) {
          setScanResult(data);
          setError(null);
          // Fetch complete booking details
          await fetchBookingDetails(data.bookingId);
        } else {
          setError('Invalid QR code format');
        }
      } catch {
        setError('Could not parse QR code data');
      }
    } catch (err) {
      setError('Failed to scan QR code from image. Please try another image.');
      console.error('QR scan error:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initScanner = useCallback(() => {
    if (scanMode !== 'camera') return;

    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }

    setTimeout(() => {
      const element = document.getElementById('qr-reader');
      if (!element) {
        console.warn('QR reader element not found');
        return;
      }

      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          showTorchButtonIfSupported: true,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          try {
            const data = JSON.parse(decodedText) as CheckinData;
            if (data.type === 'CHECKIN' && data.bookingId) {
              setScanResult(data);
              setError(null);
              scannerRef.current?.clear().catch(() => {});
              // Fetch complete booking details
              await fetchBookingDetails(data.bookingId);
            } else {
              setError('Invalid QR code format');
            }
          } catch {
            setError('Could not parse QR code data');
          }
        },
        () => {}
      );
    }, 100);
  }, [scanMode]);

  useEffect(() => {
    initScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [initScanner]);

  const handleCheckin = async () => {
    if (!scanResult) return;

    setIsProcessing(true);
    setCheckinResult(null);

    try {
      const response = await fetch('/api/bookings/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: scanResult.bookingId,
          roomId: scanResult.roomId,
        }),
      });

      const result = await response.json();
      setCheckinResult(result);
    } catch {
      setCheckinResult({ valid: false, error: 'Network error. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setBookingDetails(null);
    setCheckinResult(null);
    setError(null);
    setTimeout(() => {
      initScanner();
    }, 50);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div>
          <p className="text-sm text-slate-500">Admin / Check-in</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 hover:text-slate-700">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
              <p className="text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
          {/* QR Scanner Module */}
          <div className="lg:col-span-3 flex flex-col bg-white p-6 rounded-xl border border-slate-200">
            <h1 className="text-slate-900 tracking-tight text-2xl font-bold leading-tight mb-2">
              Scan Guest QR Code
            </h1>
            <p className="text-slate-500 text-base font-normal leading-normal mb-4">
              Position the QR code inside the frame to check-in.
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setScanMode('upload')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  scanMode === 'upload'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg mr-2 align-middle">upload_file</span>
                Upload Image
              </button>
              <button
                onClick={() => setScanMode('camera')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  scanMode === 'camera'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg mr-2 align-middle">photo_camera</span>
                Use Camera
              </button>
            </div>

            {!scanResult && !checkinResult && (
              <div className="flex-1 flex flex-col items-center justify-center">
                {scanMode === 'upload' ? (
                  <div className="w-full max-w-md">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="qr-file-input"
                    />
                    <div id="qr-reader-file" className="hidden"></div>
                    <label
                      htmlFor="qr-file-input"
                      className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">upload_file</span>
                      <p className="text-slate-600 font-medium mb-2">Click to upload QR code image</p>
                      <p className="text-slate-400 text-sm">PNG, JPG up to 10MB</p>
                    </label>
                    {isProcessing && (
                      <div className="mt-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-slate-600 text-sm mt-2">Scanning QR code...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full max-w-md aspect-square rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center">
                  <div id="qr-reader" className="w-full h-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2/3 h-2/3 border-4 border-white/50 rounded-lg border-dashed"></div>
                  </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-sm text-white text-center py-2 rounded-lg text-sm">
                      Scanning...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center w-full max-w-md">
                    {error}
                  </div>
                )}
                {scanMode === 'camera' && (
                  <button className="mt-6 text-sm font-medium text-primary hover:underline">
                    Can&apos;t scan? Find booking manually.
                  </button>
                )}
              </div>
            )}

            {scanResult && !checkinResult && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Booking ID</p>
                      <p className="text-sm font-semibold text-slate-900">#{scanResult.bookingId.slice(-8).toUpperCase()}</p>
                    </div>
                    {scanResult.guestName && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-500">Guest</p>
                        <p className="text-sm font-semibold text-slate-900">{scanResult.guestName}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Check-in</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(scanResult.checkIn)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Check-out</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(scanResult.checkOut)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Guests</p>
                      <p className="text-sm font-semibold text-slate-900">{scanResult.guests}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCheckin}
                      disabled={isProcessing}
                      className="w-full text-white bg-primary hover:bg-primary/90 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Check-in'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full text-slate-600 bg-transparent hover:bg-slate-100 border border-slate-200 font-medium rounded-lg text-sm px-5 py-3 text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {checkinResult && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-md text-center">
                  {checkinResult.valid ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Check-in Successful!</h2>
                      <p className="text-slate-600 mb-6">{checkinResult.message}</p>
                      {checkinResult.booking && (
                        <div className="bg-green-50 rounded-xl p-6 text-left space-y-3 mb-6 border border-green-200">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-slate-500">Guest</p>
                            <p className="text-sm font-semibold text-slate-900">{checkinResult.booking.guestName}</p>
                          </div>
                          {checkinResult.booking.roomName && (
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-slate-500">Room</p>
                              <p className="text-sm font-semibold text-slate-900">{checkinResult.booking.roomName}</p>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-slate-500">Status</p>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 capitalize">
                              {checkinResult.booking.status}
                            </span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleReset}
                        className="w-full text-white bg-primary hover:bg-primary/90 font-medium rounded-lg text-sm px-5 py-3 text-center"
                      >
                        Scan Next Guest
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-600 text-4xl">cancel</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Check-in Failed</h2>
                      <p className="text-red-600 mb-6">{checkinResult.error}</p>
                      <button
                        onClick={handleReset}
                        className="w-full text-white bg-primary hover:bg-primary/90 font-medium rounded-lg text-sm px-5 py-3 text-center"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Details Card */}
          <div className="lg:col-span-2 flex flex-col bg-white p-6 rounded-xl border border-slate-200">
            {!scanResult && !checkinResult ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                <span className="material-symbols-outlined text-6xl opacity-50">person_search</span>
                <p className="mt-4 font-medium text-slate-900">Awaiting Scan</p>
                <p className="text-sm">Scan a guest&apos;s QR code to view booking details.</p>
              </div>
            ) : scanResult && !checkinResult ? (
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h3>

                {isFetchingDetails ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-slate-600 text-sm">Loading booking details...</p>
                    </div>
                  </div>
                ) : bookingDetails ? (
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    {/* Guest Information */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-3">Guest Information</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Name</span>
                          <span className="text-sm font-semibold text-slate-900">{bookingDetails.guestName}</span>
                        </div>
                        {bookingDetails.guestEmail && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Email</span>
                            <span className="text-sm text-slate-900">{bookingDetails.guestEmail}</span>
                          </div>
                        )}
                        {bookingDetails.guestPhone && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Phone</span>
                            <span className="text-sm text-slate-900">{bookingDetails.guestPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Information */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-3">Booking Information</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Booking ID</span>
                          <span className="text-sm font-semibold text-slate-900">#{bookingDetails.id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Status</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                            bookingDetails.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            bookingDetails.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {bookingDetails.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Guests</span>
                          <span className="text-sm font-semibold text-slate-900">{bookingDetails.guests}</span>
                        </div>
                        {bookingDetails.totalPrice && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Total Price</span>
                            <span className="text-sm font-semibold text-slate-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingDetails.totalPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Information */}
                    {bookingDetails.room && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-slate-500 uppercase mb-3">Room Information</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Room Name</span>
                            <span className="text-sm font-semibold text-slate-900">{bookingDetails.room.name}</span>
                          </div>
                          {bookingDetails.room.type && (
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Type</span>
                              <span className="text-sm text-slate-900 capitalize">{bookingDetails.room.type}</span>
                            </div>
                          )}
                          {bookingDetails.room.capacity && (
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Capacity</span>
                              <span className="text-sm text-slate-900">{bookingDetails.room.capacity} guests</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stay Duration */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-3">Stay Duration</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Check-in</span>
                          <span className="text-sm font-semibold text-slate-900">{formatDate(bookingDetails.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Check-out</span>
                          <span className="text-sm font-semibold text-slate-900">{formatDate(bookingDetails.checkOut)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {bookingDetails.specialRequests && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-xs font-medium text-amber-700 uppercase mb-2">Special Requests</p>
                        <p className="text-sm text-slate-700">{bookingDetails.specialRequests}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Booking Information</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">ID</span>
                          <span className="text-sm font-semibold text-slate-900">#{scanResult.bookingId.slice(-8).toUpperCase()}</span>
                        </div>
                        {scanResult.guestName && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Guest</span>
                            <span className="text-sm font-semibold text-slate-900">{scanResult.guestName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Guests</span>
                          <span className="text-sm font-semibold text-slate-900">{scanResult.guests}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Stay Duration</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Check-in</span>
                          <span className="text-sm font-semibold text-slate-900">{formatDate(scanResult.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Check-out</span>
                          <span className="text-sm font-semibold text-slate-900">{formatDate(scanResult.checkOut)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : checkinResult?.valid && checkinResult.booking ? (
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Guest Information</h3>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                      {checkinResult.booking.guestName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{checkinResult.booking.guestName}</h2>
                      <p className="text-sm text-slate-500">Booking ID: #{checkinResult.booking.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {checkinResult.booking.guestEmail && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-500">Email</p>
                        <p className="text-sm text-slate-900">{checkinResult.booking.guestEmail}</p>
                      </div>
                    )}
                    {checkinResult.booking.guestPhone && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-500">Phone</p>
                        <p className="text-sm text-slate-900">{checkinResult.booking.guestPhone}</p>
                      </div>
                    )}
                    {checkinResult.booking.roomName && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-500">Room</p>
                        <p className="text-sm font-semibold text-slate-900">{checkinResult.booking.roomName}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Check-in</p>
                      <p className="text-sm text-slate-900">{formatDate(checkinResult.booking.checkIn)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-500">Check-out</p>
                      <p className="text-sm text-slate-900">{formatDate(checkinResult.booking.checkOut)}</p>
                    </div>
                    {checkinResult.booking.specialRequests && (
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-500 mb-2">Special Requests</p>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{checkinResult.booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                <span className="material-symbols-outlined text-6xl opacity-50">error</span>
                <p className="mt-4 font-medium text-slate-900">Check-in Failed</p>
                <p className="text-sm">Please try scanning again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
