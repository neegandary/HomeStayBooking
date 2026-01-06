'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileForm from '@/components/features/ProfileForm';
import api from '@/lib/axios';
import { User } from '@/types/auth';

export default function ProfilePage() {
  const { user } = useAuth();

  const handleUpdateProfile = async (data: Partial<User>) => {
    try {
      await api.patch('/user/profile', data);
      // In a real app, you would update the local auth context user here
      alert('Profile updated successfully! (Mock update)');
    } catch (error) {
      console.error('Failed to update profile:', error);
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
          Manage your account information and preferences.
        </p>
      </div>

      <ProfileForm user={user} onUpdate={handleUpdateProfile} />

      {/* Security Section */}
      <div className="bg-white rounded-3xl border border-primary/5 p-8 shadow-xl shadow-primary/5">
        <h2 className="text-xl font-black text-primary tracking-tight mb-8">Security</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-primary">Password</p>
                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-action transition-colors">Change Password</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20a10.003 10.003 0 006.235-2.397l.054.09a10.003 10.003 0 006.235-2.397l.054.09c.075.121.15.243.226.365C17.991 17.799 17 14.517 17 11V7a2 2 0 00-2-2H9a2 2 0 00-2 2v4c0 1.25-.25 2.441-.705 3.528M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-primary">Two-Factor Authentication</p>
                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-0.5">Add an extra layer of security</p>
              </div>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-action transition-colors">Enable</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-primary/5 rounded-3xl border border-primary/10 p-8 shadow-sm">
        <h2 className="text-xl font-black text-primary tracking-tight mb-4 uppercase">Advanced Settings</h2>
        <p className="text-sm text-primary/50 font-medium mb-8">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="bg-primary/10 text-primary px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] shadow-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
}