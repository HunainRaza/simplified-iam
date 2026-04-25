import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

// persist middleware saves the store to localStorage automatically
// So the user stays logged in across page refreshes
// Django equivalent: session cookies persisting across browser tabs
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null })
    }),
    { name: 'auth-storage' }, // localStorage key name
  ),
);
