'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-solid border-primary/10 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between whitespace-nowrap py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 text-primary">
            <div className="size-6">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">StayEasy</h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-end">
            <div className="flex items-center gap-9">
              <Link href="/" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">Home</Link>
              <Link href="/rooms" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">Stays</Link>
              <Link href="/about" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">About Us</Link>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4 ml-8">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm font-medium text-primary/60">Hi, {user?.name}</span>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-primary hover:text-action transition-colors"
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-action hover:text-action/80 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-colors"
                >
                  <span className="truncate">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-colors"
              >
                <span className="truncate">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/10">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/rooms" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Stays</Link>
              <Link href="/about" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-action text-sm font-medium hover:text-action/80 transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                  )}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-primary text-sm font-medium hover:text-action transition-colors">Logout</button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
