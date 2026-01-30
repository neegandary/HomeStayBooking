'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface SavedItinerary {
  id: string;
  guestName: string;
  stayDuration: number;
  vibe: string;
  location: string;
  intro: string;
  days: Array<{
    day: number;
    theme: string;
    activities: Array<{
      time: string;
      task: string;
      desc: string;
      pro_tip?: string;
    }>;
  }>;
  outro?: string;
  createdAt: string;
}

const VIBE_LABELS: Record<string, string> = {
  relaxing: 'Thư giãn',
  adventurous: 'Phiêu lưu',
  romantic: 'Lãng mạn',
  foodie: 'Ẩm thực',
  nature: 'Thiên nhiên',
  mixed: 'Hỗn hợp',
};

export default function MyItinerariesPage() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const { data } = await api.get('/itinerary/saved');
        setItineraries(data.itineraries || []);
      } catch (error) {
        console.error('Failed to fetch itineraries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
        <main className="px-4 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-10">
          <div className="flex flex-col max-w-4xl w-full">
            <div className="animate-pulse space-y-6">
              <div className="h-10 w-64 bg-primary/10 rounded-lg"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-primary/5 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <main className="px-4 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-10">
        <div className="flex flex-col max-w-4xl w-full">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h1 className="text-4xl font-black leading-tight tracking-tight">Lịch trình AI của tôi</h1>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo mới
            </Link>
          </div>

          {/* Itineraries List */}
          {itineraries.length > 0 ? (
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <div
                  key={itinerary.id}
                  className="bg-white rounded-xl shadow-lg shadow-primary/5 border border-primary/5 overflow-hidden"
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === itinerary.id ? null : itinerary.id)}
                    className="w-full p-6 text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-primary/60">map</span>
                          <h3 className="text-lg font-bold">
                            {itinerary.location} - {itinerary.stayDuration} ngày
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm opacity-60">
                          <span>{formatDate(itinerary.createdAt)}</span>
                          <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium">
                            {VIBE_LABELS[itinerary.vibe] || itinerary.vibe}
                          </span>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined transition-transform ${expandedId === itinerary.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedId === itinerary.id && (
                    <div className="px-6 pb-6 border-t border-primary/5 pt-4">
                      {/* Intro */}
                      <p className="text-sm text-gray-600 mb-6 italic">{itinerary.intro}</p>

                      {/* Days Timeline */}
                      <div className="space-y-6">
                        {itinerary.days.map((day) => (
                          <div key={day.day}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{day.day}</span>
                              </div>
                              <h4 className="font-bold text-primary">{day.theme}</h4>
                            </div>
                            <div className="ml-4 pl-4 border-l-2 border-primary/10 space-y-3">
                              {day.activities.map((activity, idx) => (
                                <div key={idx} className="bg-primary/5 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-primary/60">{activity.time}</span>
                                    <span className="font-semibold text-sm">{activity.task}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{activity.desc}</p>
                                  {activity.pro_tip && (
                                    <div className="mt-2 flex items-start gap-1 text-xs text-amber-700">
                                      <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '14px' }}>lightbulb</span>
                                      {activity.pro_tip}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Outro */}
                      {itinerary.outro && (
                        <p className="mt-6 text-sm text-center text-primary/60 italic">{itinerary.outro}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl bg-white border border-dashed border-primary/10">
              <span className="material-symbols-outlined text-6xl opacity-20 mb-4">route</span>
              <p className="text-lg font-bold mb-2">Chưa có lịch trình nào</p>
              <p className="text-sm opacity-50 text-center mb-6">
                Tạo lịch trình AI khi đặt phòng để lưu và xem lại ở đây
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Khám phá phòng
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
