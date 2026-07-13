'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { AuthUser, UserRoleEntry } from '@nama/shared';

interface AuthState {
  user: AuthUser | null;
  roles: UserRoleEntry[];
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  isLoading: true,
  error: null,
  refreshSession: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    roles: [],
    isLoading: true,
    error: null,
  });

  const refreshSession = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await apiFetch<{ user: AuthUser }>('/auth/me');
      setState({
        user: res.data?.user || null,
        roles: res.data?.user?.roles || [],
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      setState({
        user: null,
        roles: [],
        isLoading: false,
        error: 'Session expired',
      });
      document.cookie = 'nama_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  };

  const logout = async () => {
    try {
      // Must not use absoluteUrl: true so the Set-Cookie headers are accepted by the browser
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // Clear local state
      setState({ user: null, roles: [], isLoading: false, error: null });
      // Clear the middleware routing cookie
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `nama_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
