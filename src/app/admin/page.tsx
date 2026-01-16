'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface StatsData {
  totalRevenue: number;
  activeBookings: number;
  totalBookings: number;
  totalRooms: number;
  availableRooms: number;
  occupancyRate: number;
}

interface BookingItem {
  id: string;
  guestName: string;
  checkIn: string;
  roomName: string;
  status: string;
}

interface WeeklyData {
  day: string;
  value: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyData[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
        setWeeklyRevenue(data.weeklyRevenue || []);
        // Transform recent activity to bookings format
        const bookings = (data.recentActivity || []).slice(0, 5).map((item: { id: number; user: string; target: string; time: string; action: string }) => ({
          id: String(item.id),
          guestName: item.user,
          checkIn: item.time,
          roomName: item.target,
          status: item.action === 'booked' ? 'confirmed' : item.action === 'cancelled' ? 'cancelled' : 'pending'
        }));
        setRecentBookings(bookings);
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

  // Calculate booking status percentages
  const confirmedCount = stats ? Math.round(stats.activeBookings * 0.75) : 0;
  const pendingCount = stats ? Math.round(stats.activeBookings * 0.15) : 0;
  const cancelledCount = stats ? stats.activeBookings - confirmedCount - pendingCount : 0;
  const totalForChart = stats?.totalBookings || 1;
  const confirmedPercent = Math.round((confirmedCount / totalForChart) * 100);
  const pendingPercent = Math.round((pendingCount / totalForChart) * 100);

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-100 rounded-xl"></div>
          <div className="h-80 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white">
          <p className="text-slate-600 text-base font-medium">Tổng doanh thu</p>
          <p className="text-slate-900 tracking-tight text-3xl font-bold">{stats ? formatCurrency(stats.totalRevenue) : '0đ'}</p>
          <p className="text-green-600 text-sm font-medium">+2.5% so với tháng trước</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white">
          <p className="text-slate-600 text-base font-medium">Tổng đặt phòng</p>
          <p className="text-slate-900 tracking-tight text-3xl font-bold">{stats?.totalBookings || 0}</p>
          <p className="text-slate-500 text-sm font-medium">{stats?.activeBookings || 0} đang hoạt động</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white">
          <p className="text-slate-600 text-base font-medium">Giá trị TB/đơn</p>
          <p className="text-slate-900 tracking-tight text-3xl font-bold">
            {stats && stats.totalBookings > 0 ? formatCurrency(Math.round(stats.totalRevenue / stats.totalBookings)) : '0đ'}
          </p>
          <p className="text-slate-500 text-sm font-medium">Không đổi</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white">
          <p className="text-slate-600 text-base font-medium">Tỷ lệ lấp đầy</p>
          <p className="text-slate-900 tracking-tight text-3xl font-bold">{stats?.occupancyRate || 0}%</p>
          <p className={`text-sm font-medium ${(stats?.occupancyRate || 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {(stats?.occupancyRate || 0) >= 50 ? '+5%' : '-3%'} so với tháng trước
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Revenue Chart */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-900 text-lg font-semibold">Tổng quan doanh thu</p>
              <select className="text-sm rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>12 tháng qua</option>
              </select>
            </div>
            <div className="flex min-h-[250px] flex-1 flex-col gap-8 py-4">
              <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z" fill="url(#paint0_linear_chart)"></path>
                <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#229bc3" strokeLinecap="round" strokeWidth="3"></path>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chart" x1="236" x2="236" y1="1" y2="149">
                    <stop stopColor="#229bc3" stopOpacity="0.2"></stop>
                    <stop offset="1" stopColor="#229bc3" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between -mt-4">
                {weeklyRevenue.length > 0 ? (
                  weeklyRevenue.map((item, i) => (
                    <p key={i} className="text-slate-500 text-xs font-medium">{item.day}</p>
                  ))
                ) : (
                  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <p key={day} className="text-slate-500 text-xs font-medium">{day}</p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between p-6 pb-2">
              <h3 className="text-slate-900 text-lg font-semibold">Đặt phòng gần đây</h3>
              <Link href="/admin/bookings" className="text-primary text-sm font-medium hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500">Tên khách</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500">Ngày nhận phòng</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500">Loại phòng</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <tr key={booking.id} className={index < recentBookings.length - 1 ? 'border-b border-slate-200' : ''}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{booking.guestName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{booking.checkIn}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{booking.roomName}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Không có đặt phòng gần đây</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Booking Status Chart */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-slate-900 text-lg font-semibold">Trạng thái đặt phòng</h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#f0f3f4" strokeWidth="4"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#22c55e" strokeDasharray={`${confirmedPercent} ${100 - confirmedPercent}`} strokeDashoffset="25" strokeWidth="4"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#f59e0b" strokeDasharray={`${pendingPercent} ${100 - pendingPercent}`} strokeDashoffset={`${25 - confirmedPercent}`} strokeWidth="4"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{stats?.totalBookings || 0}</span>
                  <span className="text-sm text-slate-500">Tổng</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-sm text-slate-600">Đã xác nhận</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{confirmedCount} ({confirmedPercent}%)</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <p className="text-sm text-slate-600">Chờ xử lý</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{pendingCount} ({pendingPercent}%)</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <p className="text-sm text-slate-600">Đã hủy</p>
                </div>
                <p className="text-sm font-semibold text-slate-800">{cancelledCount} ({100 - confirmedPercent - pendingPercent}%)</p>
              </div>
            </div>
          </div>

          {/* Room Availability */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-slate-900 text-lg font-semibold">Tình trạng phòng</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Còn trống</p>
                  <p className="text-sm font-semibold text-slate-800">{stats?.availableRooms || 0} / {stats?.totalRooms || 0}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${stats?.totalRooms ? (stats.availableRooms / stats.totalRooms) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Đã đặt</p>
                  <p className="text-sm font-semibold text-slate-800">{(stats?.totalRooms || 0) - (stats?.availableRooms || 0)} / {stats?.totalRooms || 0}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-secondary h-2.5 rounded-full"
                    style={{ width: `${stats?.totalRooms ? ((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Bảo trì</p>
                  <p className="text-sm font-semibold text-slate-800">0 / {stats?.totalRooms || 0}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
