import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTokens, Role } from '@nama/shared';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  getActiveRole: () => Role | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        // Also mirror accessToken in localStorage for apiFetch to pick up
        localStorage.setItem('nama_access_token', tokens.accessToken);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        localStorage.removeItem('nama_access_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      getActiveRole: () => {
        const { user } = get();
        return user?.roles[0]?.role ?? null;
      },
    }),
    {
      name: 'nama_auth',
      // Only persist tokens and user — not derived state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
