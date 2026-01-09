'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface CheckinData {
  type: string;
  bookingId: string;
  roomId: string;
  guestName?: string; // Optional - may not be in QR
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
    checkIn: string;
    checkOut: string;
    guests: number;
    roomId: string;
    status: string;
  };
}

export default function AdminCheckinPage() {
  const [scanResult, setScanResult] = useState<CheckinData | null>(null);
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const initScanner = useCallback(() => {
    // Clean up existing scanner first
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }

    // Small delay to ensure DOM is ready
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
          // Experimental: improve scanning for screens
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText) as CheckinData;
            if (data.type === 'CHECKIN' && data.bookingId) {
              setScanResult(data);
              setError(null);
              // Stop scanner after successful scan
              scannerRef.current?.clear().catch(() => {});
            } else {
              setError('Invalid QR code format');
            }
          } catch {
            setError('Could not parse QR code data');
          }
        },
        () => {
          // Ignore scan errors (no QR found) - this is normal when no QR is in view
        }
      );
    }, 100);
  }, []);

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
    setCheckinResult(null);
    setError(null);

    // Reinitialize scanner after state reset
    setTimeout(() => {
      initScanner();
    }, 50);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">Guest Check-in</h1>
        <p className="text-primary/50 mt-2">Scan guest QR code to process check-in</p>
      </div>

      {/* Scanner Section - Always rendered but hidden when not needed */}
      <div className={`${scanResult ? 'hidden' : ''}`}>
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-black text-primary uppercase tracking-tight">Scan QR Code</h3>
            <p className="text-primary/40 text-sm mt-1">Point camera at guest&apos;s booking QR code</p>
          </div>

          <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && !checkinResult && (
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-black text-primary uppercase tracking-tight">QR Code Scanned</h3>
            <p className="text-primary/40 text-sm mt-1">Verify booking details below</p>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 space-y-4 mb-8">   
            <div className="flex justify-between">
              <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Booking ID</span>
              <span className="font-mono text-sm text-primary">#{scanResult.bookingId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Check-in</span>
              <span className="font-bold text-primary">{scanResult.checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Check-out</span>
              <span className="font-bold text-primary">{scanResult.checkOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Guests</span>
              <span className="font-bold text-primary">{scanResult.guests}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-4 rounded-xl border-2 border-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckin}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-xl bg-secondary text-white font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/30 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Confirm Check-in'}
            </button>
          </div>
        </div>
      )}

      {/* Check-in Result */}
      {checkinResult && (
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5">
          {checkinResult.valid ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">Check-in Successful!</h2>
              <p className="text-primary/50 mb-8">{checkinResult.message}</p>

              {checkinResult.booking && (
                <div className="bg-secondary/5 rounded-2xl p-6 text-left space-y-3 mb-8 border border-secondary/10">
                  <div className="flex justify-between">
                    <span className="text-xs font-black text-primary/40 uppercase">Guest</span>
                    <span className="font-black text-primary">{checkinResult.booking.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-black text-primary/40 uppercase">Status</span>
                    <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-lg text-xs font-black uppercase">
                      {checkinResult.booking.status}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Scan Next Guest
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">Check-in Failed</h2>
              <p className="text-red-500 mb-8">{checkinResult.error}</p>

              <button
                onClick={handleReset}
                className="w-full py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
