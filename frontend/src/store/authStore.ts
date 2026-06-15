import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  user: { username: string; email: string; role: string } | null;
  isAuthenticated: boolean;

  setAuth: (auth: AuthResponse) => void;
  logout:  () => void;
}

/**
 * Zustand store for authentication state.
 * Persists token + user to localStorage automatically via zustand/persist.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (auth: AuthResponse) => {
        localStorage.setItem('access_token', auth.accessToken);
        set({
          token: auth.accessToken,
          user: { username: auth.username, email: auth.email, role: auth.role },
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'railfan-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
