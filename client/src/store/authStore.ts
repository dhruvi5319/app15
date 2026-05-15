import { create } from 'zustand';

interface AuthState {
  access_token: string | null;
  user: { id: string; email: string } | null;
  setAuth: (access_token: string, user: { id: string; email: string }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  access_token: null,
  user: null,
  setAuth: (access_token, user) => set({ access_token, user }),
  clearAuth: () => set({ access_token: null, user: null }),
  isAuthenticated: () => get().access_token !== null,
}));
