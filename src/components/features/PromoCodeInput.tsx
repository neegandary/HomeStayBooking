'use client';

import React, { useState } from 'react';

interface PromoCodeInputProps {
  orderValue: number;
  onApply: (data: { code: string; discount: number }) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  orderValue,
  onApply,
  onRemove,
  appliedCode,
  appliedDiscount,
}) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), orderValue }),
      });
      const data = await res.json();

      if (data.valid) {
        setStatus('success');
        setMessage(`${data.promoName}: -${data.discount.toLocaleString('vi-VN')}đ`);
        onApply({ code: code.trim().toUpperCase(), discount: data.discount });
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid promo code');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to validate promo code');
    }
  };

  const handleRemove = () => {
    setCode('');
    setStatus('idle');
    setMessage('');
    onRemove();
  };

  // If a code is already applied, show applied state
  if (appliedCode && appliedDiscount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-green-800 uppercase tracking-wider">{appliedCode}</p>
              <p className="text-sm font-bold text-green-600">-{appliedDiscount.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-green-600 hover:text-green-800 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          disabled={status === 'loading'}
          className="flex-1 bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary uppercase tracking-wider focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-primary/20 placeholder:normal-case placeholder:tracking-normal disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={status === 'loading' || !code.trim()}
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            status === 'loading' || !code.trim()
              ? 'bg-primary/10 text-primary/30 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
          }`}
        >
          {status === 'loading' ? 'Checking...' : 'Apply'}
        </button>
      </div>

      {message && (
        <p className={`text-xs font-bold ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PromoCodeInput;
