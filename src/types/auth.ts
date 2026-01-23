export type UserRole = 'user' | 'guest' | 'admin';

/**
 * Check if a role has admin privileges
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if a role can make bookings
 */
export function canBookRoom(role: UserRole): boolean {
  return role !== 'guest';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  name: string;
}