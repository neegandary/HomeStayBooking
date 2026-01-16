'use client';

import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import PromotionTable from '@/components/admin/PromotionTable';
import PromotionModal from '@/components/admin/PromotionModal';

export interface Promotion {
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

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const fetchPromotions = async () => {
    try {
      const { data } = await api.get('/promotions');
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await api.delete(`/promotions/${id}`);
      fetchPromotions();
    } catch (error) {
      console.error('Failed to delete promotion:', error);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await api.put(`/promotions/${promotion.id}`, { active: !promotion.active });
      fetchPromotions();
    } catch (error) {
      console.error('Failed to toggle promotion:', error);
    }
  };

  const handleSave = async (data: Partial<Promotion>) => {
    try {
      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion.id}`, data);
      } else {
        await api.post('/promotions', data);
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error('Failed to save promotion:', error);
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to save promotion';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">Promotions</h1>
          <p className="text-primary/40 text-sm font-bold mt-1">Manage promo codes and discounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          + New Promotion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-primary/5 shadow-lg shadow-primary/5">
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total</p>
          <p className="text-3xl font-black text-primary mt-2">{promotions.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-primary/5 shadow-lg shadow-primary/5">
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Active</p>
          <p className="text-3xl font-black text-green-600 mt-2">
            {promotions.filter(p => p.active && new Date(p.validTo) >= new Date()).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-primary/5 shadow-lg shadow-primary/5">
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Expired</p>
          <p className="text-3xl font-black text-red-500 mt-2">
            {promotions.filter(p => new Date(p.validTo) < new Date()).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-primary/5 shadow-lg shadow-primary/5">
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total Uses</p>
          <p className="text-3xl font-black text-primary mt-2">
            {promotions.reduce((sum, p) => sum + p.usedCount, 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <PromotionTable
        promotions={promotions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Modal */}
      {isModalOpen && (
        <PromotionModal
          promotion={editingPromotion}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
