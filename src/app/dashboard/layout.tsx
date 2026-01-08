'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/dashboard');
        return;
      }
      // Redirect admin users to admin dashboard
      if (user?.role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth or if admin (will be redirected)
  if (isLoading || !isAuthenticated || user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row bg-primary/5">
      <DashboardSidebar />
      <main className="bg-white flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="container mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}