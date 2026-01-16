'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on admin and dashboard routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

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
              <Link href="/" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">Trang chủ</Link>
              <Link href="/rooms" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">Phòng</Link>
              <Link href="/about" className="text-primary text-sm font-medium leading-normal hover:text-action transition-colors">Giới thiệu</Link>
            </div>
          </nav>

          {/* Profile Menu / Auth Buttons */}
          <div className="flex items-center gap-3 ml-8 relative">
            {isAuthenticated ? (
              <>
                {/* Unified Profile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-primary/5 transition-all group"
                  aria-label="Toggle profile menu"
                >
                  {/* User Avatar */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-sm group-hover:bg-primary/90 transition-colors">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* Dropdown Indicator */}
                  <span className="material-symbols-outlined text-primary text-xl">
                    {mobileMenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Desktop Dropdown Menu */}
                {mobileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-primary/10 py-2 z-50">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-base">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">Xin chào, {user?.name}</span>
                        <span className="text-xs text-primary/60">{user?.email}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                        Bảng điều khiển
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-action hover:bg-primary/5 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                          Quản trị
                        </Link>
                      )}
                      <div className="border-t border-primary/10 my-2"></div>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-colors"
                >
                  <span className="truncate">Đăng nhập</span>
                </Link>

                {/* Mobile Menu Button for non-authenticated users */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
                  aria-label="Toggle menu"
                >
                  <span className="material-symbols-outlined text-primary">
                    {mobileMenuOpen ? 'close' : 'menu'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu for non-authenticated users */}
        {mobileMenuOpen && !isAuthenticated && (
          <div className="md:hidden py-4 border-t border-primary/10">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
              <Link href="/rooms" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Phòng</Link>
              <Link href="/about" className="text-primary text-sm font-medium hover:text-action transition-colors" onClick={() => setMobileMenuOpen(false)}>Giới thiệu</Link>
              <div className="border-t border-primary/10 my-2"></div>
              <Link
                href="/login"
                className="text-primary text-sm font-medium hover:text-action transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
