'use client';

import React from 'react';

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

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  onToggleActive: (promotion: Promotion) => void;
}

const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatValue = (promo: Promotion) => {
    if (promo.type === 'percentage') {
      return `${promo.value}%`;
    }
    return `${promo.value.toLocaleString('vi-VN')}đ`;
  };

  const getStatus = (promo: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validTo = new Date(promo.validTo);

    if (!promo.active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    if (now < validFrom) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-600' };
    if (now > validTo) return { label: 'Expired', color: 'bg-red-100 text-red-600' };
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return { label: 'Exhausted', color: 'bg-orange-100 text-orange-600' };
    }
    return { label: 'Active', color: 'bg-green-100 text-green-600' };
  };

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-primary/5 p-12 text-center">
        <p className="text-primary/40 font-bold">No promotions yet</p>
        <p className="text-primary/20 text-sm mt-1">Create your first promotion to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden shadow-lg shadow-primary/5">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/5">
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Code</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Name</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Discount</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Valid Period</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Usage</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => {
              const status = getStatus(promo);
              return (
                <tr key={promo.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-black text-primary text-sm tracking-wider">{promo.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary/80 text-sm">{promo.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-primary text-sm">{formatValue(promo)}</span>
                    {promo.maxDiscount && promo.type === 'percentage' && (
                      <span className="text-primary/40 text-xs ml-1">(max {promo.maxDiscount.toLocaleString('vi-VN')}đ)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
            <span className="text-primary/60 text-xs font-bold">
                      {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary/80 text-sm">
                      {promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleActive(promo)}
                        className={`p-2 rounded-lg transition-colors ${
                          promo.active ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-500'
                        }`}
                        title={promo.active ? 'Deactivate' : 'Activate'}
                      >
                        {promo.active ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(promo)}
                        className="p-2 rounded-lg hover:bg-primary/5 text-primary/60 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(promo.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionTable;
