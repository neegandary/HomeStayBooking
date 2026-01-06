'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">S</div>
          <span className="text-xl font-black tracking-tighter text-primary">StayEasy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-primary/70">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/rooms" className="hover:text-primary transition-colors">Rooms</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-primary/60">Hi, {user?.name}</span>
              <Link
                href="/dashboard"
                className="text-sm font-black text-primary hover:text-action transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-primary border-2 border-primary/10 rounded-xl hover:bg-primary/5 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-action rounded-xl hover:bg-tiger-orange transition-all shadow-xl shadow-action/20 active:scale-[0.98]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}