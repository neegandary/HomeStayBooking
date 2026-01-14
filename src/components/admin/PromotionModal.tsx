'use client';

import React, { useState, useEffect } from 'react';

interface Promotion {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  createdAt?: string;
}

interface PromotionModalProps {
  promotion: Promotion | null;
  onSave: (data: Partial<Promotion>) => void;
  onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderValue: 0,
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        minOrderValue: promotion.minOrderValue,
        maxDiscount: promotion.maxDiscount?.toString() || '',
        validFrom: promotion.validFrom.split('T')[0],
        validTo: promotion.validTo.split('T')[0],
        usageLimit: promotion.usageLimit?.toString() || '',
        active: promotion.active,
      });
    } else {
      // Default dates for new promotion
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData(prev => ({
        ...prev,
        validFrom: today.toISOString().split('T')[0],
        validTo: nextMonth.toISOString().split('T')[0],
      }));
    }
  }, [promotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data: Partial<Promotion> = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      value: formData.value,
      minOrderValue: formData.minOrderValue,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      active: formData.active,
    };

    if (formData.maxDiscount) {
      data.maxDiscount = parseInt(formData.maxDiscount);
    }
    if (formData.usageLimit) {
      data.usageLimit = parseInt(formData.usageLimit);
    }

    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
              {promotion ? 'Edit Promotion' : 'New Promotion'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Promo Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary uppercase tracking-wider focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Summer Sale"
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            {/* Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (VND)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  {formData.type === 'percentage' ? 'Percentage' : 'Amount (VND)'}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={formData.type === 'percentage' ? 100 : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Min Order Value (VND)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: parseInt(e.target.value) || 0 }))}
            className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                    Max Discount (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                    placeholder="Optional"
                    className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                  />
                </div>
              )}
            </div>

            {/* Valid Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Valid To
                </label>
                <input
                  type="date"
                  required
                  value={formData.validTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            {/* Usage Limit & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.usageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                  className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-bold text-primary">Active</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-bold text-sm text-primary/60 hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Saving...' : promotion ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
