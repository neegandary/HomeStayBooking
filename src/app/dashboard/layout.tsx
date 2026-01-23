'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayoutSidebar from '@/components/layout/DashboardLayoutSidebar';

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
    <div className="min-h-screen bg-background-light flex">
      <DashboardLayoutSidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}