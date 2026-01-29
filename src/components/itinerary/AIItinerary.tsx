'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { AIItineraryProps, ItineraryInput, ItineraryResponse } from '@/types/itinerary';
import AIItinerarySkeleton from './AIItinerarySkeleton';

/**
 * Vibe options for travel style selection
 * Each vibe has a label, icon, and color scheme matching Da Lat aesthetic
 */
const VIBE_OPTIONS = [
  { value: 'relaxing', label: 'Thư giãn', icon: 'spa', color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
  { value: 'adventurous', label: 'Phiêu lưu', icon: 'hiking', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'romantic', label: 'Lãng mạn', icon: 'favorite', color: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'foodie', label: 'Ẩm thực', icon: 'restaurant', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'nature', label: 'Thiên nhiên', icon: 'forest', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'mixed', label: 'Hỗn hợp', icon: 'explore', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
] as const;

/**
 * AI Itinerary Component
 *
 * Generates personalized travel itineraries for Da Lat using Gemini AI.
 * Features:
 * - Input form for guest name, stay duration, and travel vibe
 * - Loading skeleton with Da Lat aesthetic
 * - Vertical timeline display of itinerary
 * - Error state with retry option
 * - Regenerate functionality
 */
export default function AIItinerary({ roomName, city }: AIItineraryProps) {
  const [input, setInput] = useState<ItineraryInput>({
    guestName: '',
    stayDuration: 2,
    vibe: 'mixed',
  });
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles itinerary generation form submission
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/itinerary', input);
      setItinerary(data.itinerary);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets state to allow regeneration
   */
  const handleRetry = () => {
    setError(null);
    setItinerary(null);
  };

  // Loading state - show skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 p-6">
        <AIItinerarySkeleton />
      </div>
    );
  }

  // Error state - show error with retry button
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="mt-3 text-red-600 font-medium">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Itinerary display - show generated itinerary with timeline
  if (itinerary) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 p-6">
        {/* Header with intro */}
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-primary/20">map</span>
          <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">{itinerary.intro}</p>
        </div>

        {/* Days timeline */}
        <div className="space-y-8">
          {itinerary.days.map((day) => (
            <div key={day.day} className="relative">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{day.day}</span>
                </div>
                <h4 className="text-lg font-bold text-primary">{day.theme}</h4>
              </div>

              {/* Activities with vertical timeline */}
              <div className="ml-6 pl-6 border-l-2 border-primary/10 space-y-4">
                {day.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gradient-to-br from-primary/5 to-white rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Time badge on timeline */}
                    <div className="absolute -left-[33px] top-4 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                      {activity.time.split(':')[0]}
                    </div>

                    <div className="pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary/60">{activity.time}</span>
                        <h5 className="font-semibold text-gray-800">{activity.task}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{activity.desc}</p>
                      {activity.pro_tip && (
                        <div className="mt-2 flex items-start gap-2 bg-amber-50 rounded-lg p-2">
                          <span className="material-symbols-outlined text-amber-500 text-sm flex-shrink-0 mt-0.5">lightbulb</span>
                          <p className="text-xs text-amber-700">{activity.pro_tip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Regenerate button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setItinerary(null)}
            className="px-6 py-3 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-colors font-medium inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Tạo lịch trình mới
          </button>
        </div>
      </div>
    );
  }

  // Input form - default state
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 p-6">
      <div className="text-center mb-6">
        <span className="material-symbols-outlined text-6xl text-primary/20">auto_awesome</span>
        <h3 className="mt-2 text-xl font-bold text-primary">Lịch trình Đà Lạt AI</h3>
        <p className="text-sm text-gray-500">Để AI tạo lịch trình hoàn hảo cho bạn</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Guest name input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Tên của bạn
          </label>
          <input
            type="text"
            required
            value={input.guestName}
            onChange={(e) => setInput({ ...input, guestName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            placeholder="Nhập tên của bạn..."
          />
        </div>

        {/* Stay duration slider */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Số ngày ở
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="7"
              value={input.stayDuration}
              onChange={(e) => setInput({ ...input, stayDuration: Number(e.target.value) })}
              className="flex-1 accent-primary cursor-pointer"
            />
            <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              {input.stayDuration}
            </span>
          </div>
        </div>

        {/* Vibe selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Phong cách du lịch
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe.value}
                type="button"
                onClick={() => setInput({ ...input, vibe: vibe.value })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  input.vibe === vibe.value
                    ? 'ring-2 ring-primary ring-offset-2'
                    : ''
                } ${vibe.color}`}
              >
                <span className="material-symbols-outlined mr-1 text-sm vertical-middle">{vibe.icon}</span>
                {vibe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang tạo...' : 'Tạo lịch trình'}
        </button>
      </form>
    </div>
  );
}
