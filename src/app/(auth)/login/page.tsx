'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      window.location.href = redirect; // Using window.location to ensure fresh state
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/5 border border-primary/5">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-primary tracking-tight mb-2">Chào mừng trở lại</h1>
        <p className="text-primary/50 font-medium text-sm">Đăng nhập để quản lý trải nghiệm homestay của bạn.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Địa chỉ Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-primary/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none transition-all placeholder:text-primary/20"
            placeholder="test@example.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-[10px] font-black text-primary/40 uppercase tracking-widest">Mật khẩu</label>
            <Link href="#" className="text-[10px] font-black text-primary hover:text-action transition-colors">Quên mật khẩu?</Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-primary/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none transition-all placeholder:text-primary/20"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-deep-space transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-primary/50 font-medium">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-primary font-black hover:text-action transition-colors underline decoration-primary/10 underline-offset-8">
            Tạo tài khoản
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-primary/5">
        <div className="bg-primary/5 p-4 rounded-xl text-[10px] text-primary/40 leading-relaxed italic">
          <span className="font-black text-primary block mb-1">Thông tin đăng nhập Demo:</span>
          Email: test@example.com <br />
          Mật khẩu: password
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/5 border border-primary/5 animate-pulse">
        <div className="h-8 w-48 bg-primary/5 rounded mx-auto mb-10"></div>
        <div className="space-y-6">
          <div className="h-12 bg-primary/5 rounded-xl"></div>
          <div className="h-12 bg-primary/5 rounded-xl"></div>
          <div className="h-14 bg-primary/10 rounded-2xl"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
