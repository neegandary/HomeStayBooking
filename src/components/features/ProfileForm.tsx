'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';

interface ProfileFormProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch {
      // Error handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-primary/5 p-8 shadow-xl shadow-primary/5">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-primary tracking-tight uppercase">Personal Information</h2>
          <p className="text-sm text-primary/50 font-medium">Manage your public profile and contact details.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm ${
            isEditing
              ? 'bg-primary/5 text-primary/40 hover:bg-primary/10'
              : 'bg-primary text-white hover:bg-deep-space shadow-primary/20'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-primary/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-primary/20"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
            <input
              type="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-primary/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-primary focus:bg-white focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-primary/20"
            />
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-deep-space transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;