'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '@/types/room';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Room>) => void;
  room?: Room | null;
  title: string;
}

export default function RoomModal({
  isOpen,
  onClose,
  onSubmit,
  room,
  title,
}: RoomModalProps) {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    description: '',
    price: 0,
    capacity: 1,
    amenities: [],
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop'],
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        capacity: 1,
        amenities: [],
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop'],
      });
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const commonAmenities = [
    'WiFi',
    'TV',
    'Kitchen',
    'Air Conditioning',
    'Free Parking',
    'Pool',
    'Workspace',
  ];

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-primary/5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                Room Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl border border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-primary"
                placeholder="e.g., Luxury Ocean Suite"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl border border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-primary resize-none"
                placeholder="Tell guests about this amazing room..."
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                Price per night (VND)
              </label>
              <input
                required
                type="number"
                min="0"
                step="50000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-5 py-3 rounded-2xl border border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-primary"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                Max Capacity
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-5 py-3 rounded-2xl border border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-primary"
              />
            </div>

            {/* Amenities */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      formData.amenities?.includes(amenity)
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-primary/5 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              {room ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}