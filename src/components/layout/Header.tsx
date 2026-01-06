'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          StayEasy
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/rooms" className="hover:text-blue-600">Rooms</Link>
          <Link href="/about" className="hover:text-blue-600">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hi, {user?.name}</span>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-blue-600"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 border rounded-md hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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