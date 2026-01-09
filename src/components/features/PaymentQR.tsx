'use client';

import React, { useEffect } from 'react';
import { PaymentInfo } from '@/types/payment';
import Image from 'next/image';

interface PaymentQRProps {
  paymentInfo: PaymentInfo;
  onSuccess: () => void;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const PaymentQR: React.FC<PaymentQRProps> = ({ paymentInfo, onSuccess, status }) => {
  useEffect(() => {
    if (status === 'confirmed') {
      onSuccess();
    }
  }, [status, onSuccess]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/20 to-action/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
            <Image
              src={paymentInfo.qrUrl}
              alt="VietQR Payment"
              width={300}
              height={300}
              className="rounded-2xl"
              priority
            />
            {status === 'confirmed' && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">Payment Received!</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-action animate-pulse' : 'bg-secondary'}`}></div>
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
              {status === 'pending' ? 'Waiting for payment...' : 'Payment Confirmed'}
            </span>
          </div>
          <p className="text-xs font-medium text-primary/60 max-w-[280px] leading-relaxed mx-auto">
            Scan the QR code using any banking app in Vietnam to complete your booking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Bank</span>
            <span className="text-xs font-black text-primary uppercase tracking-tight">{paymentInfo.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Account Name</span>
            <span className="text-xs font-black text-primary uppercase tracking-tight">{paymentInfo.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Account Number</span>
            <span className="text-xs font-black text-primary tracking-tighter">{paymentInfo.accountNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Amount</span>
            <span className="text-sm font-black text-action tracking-tighter">{paymentInfo.amount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-primary/5">
            <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Message</span>
            <span className="text-xs font-black text-primary tracking-tighter">{paymentInfo.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;
