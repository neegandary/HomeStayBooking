'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import { AuthState, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  const logout = useCallback(async () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      // Interceptor handles refresh, if it fails, we end up here or it redirects
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setState((prev) => ({
        ...prev,
        user: JSON.parse(storedUser),
        isAuthenticated: true,
      }));
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { data: responseData } = await api.post('/auth/register', data);
      Cookies.set('accessToken', responseData.accessToken);
      Cookies.set('refreshToken', responseData.refreshToken);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      setState({ user: responseData.user, isLoading: false, isAuthenticated: true });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};