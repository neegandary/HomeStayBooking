'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({ name, email, password });
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/5 border border-primary/5">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-primary tracking-tight mb-2">Create Account</h1>
        <p className="text-primary/50 font-medium text-sm">Join StayEasy and start your journey today.</p>
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
          <label htmlFor="name" className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Full Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-primary/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none transition-all placeholder:text-primary/20"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Email Address</label>
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
          <label htmlFor="password" className="block text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Password</label>
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-primary/50 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-black hover:text-action transition-colors underline decoration-primary/10 underline-offset-8">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/5 border border-primary/5 animate-pulse">
        <div className="h-8 w-48 bg-primary/5 rounded mx-auto mb-10"></div>
        <div className="space-y-6">
          <div className="h-12 bg-primary/5 rounded-xl"></div>
          <div className="h-12 bg-primary/5 rounded-xl"></div>
          <div className="h-12 bg-primary/5 rounded-xl"></div>
          <div className="h-14 bg-primary/10 rounded-2xl"></div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
