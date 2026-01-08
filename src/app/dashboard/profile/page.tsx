'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileForm from '@/components/features/ProfileForm';
import api from '@/lib/axios';
import { User } from '@/types/auth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpdateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.patch('/user/profile', data);
      // Update local auth context with new user data
      if (setUser && response.data) {
        setUser(response.data);
      }
      setUpdateStatus('success');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
      throw error;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
          Profile Settings
        </h1>
        <p className="text-primary/50 font-medium mt-1">
          Manage your account information.
        </p>
      </div>

      {/* Status Messages */}
      {updateStatus === 'success' && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-bold text-secondary">Profile updated successfully!</span>
        </div>
      )}

      {updateStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-bold text-red-500">Failed to update profile. Please try again.</span>
        </div>
      )}

      <ProfileForm user={user} onUpdate={handleUpdateProfile} />

      {/* Account Info Section */}
      <div className="bg-white rounded-3xl border border-primary/5 p-8 shadow-xl shadow-primary/5">
        <h2 className="text-xl font-black text-primary tracking-tight mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-primary">Role</p>
                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              user.role === 'admin'
                ? 'bg-action/10 text-action'
                : 'bg-secondary/10 text-secondary'
            }`}>
              {user.role}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-primary">Email</p>
                <p className="text-xs text-primary/60 font-medium mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
