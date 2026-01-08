'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard, RevenueChart } from '@/components/admin';
import api from '@/lib/axios';

interface StatsData {
  totalRevenue: number;
  activeBookings: number;
  totalBookings: number;
  totalRooms: number;
  availableRooms: number;
  occupancyRate: number;
}

interface WeeklyData {
  day: string;
  value: number;
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  amount: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
        setWeeklyRevenue(data.weeklyRevenue);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const statCards = stats ? [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.activeBookings} active`,
      isPositive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Active Bookings',
      value: String(stats.activeBookings),
      change: `of ${stats.totalBookings} total`,
      isPositive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Total Rooms',
      value: String(stats.totalRooms),
      change: `${stats.availableRooms} available`,
      isPositive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      change: 'today',
      isPositive: stats.occupancyRate >= 50,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-primary/5 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-primary/5 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 h-64 bg-primary/5 rounded-3xl" />
          <div className="h-64 bg-primary/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-primary/60 mt-1">
          Here&apos;s what&apos;s happening with your homestay today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Weekly Revenue Chart */}
        <div className="xl:col-span-2">
          <RevenueChart data={weeklyRevenue} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm">
          <h3 className="font-black text-primary mb-6">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.action === 'booked' ? 'bg-green-500' :
                    activity.action === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary">
                      <span className="font-black">{activity.user}</span> {activity.action} <span className="font-black">{activity.target}</span>
                    </p>
                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                  <div className="text-xs font-black text-primary">
                    {activity.amount !== '0đ' && activity.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-primary/40 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
