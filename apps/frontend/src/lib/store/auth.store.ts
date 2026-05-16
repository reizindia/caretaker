import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  flatId?: string;
  flatNumber?: string;
  isActive: boolean;
  flat?: {
    id: string;
    name: string;
    slug: string;
    themeColor?: string;
    logoUrl?: string;
  };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('caretaker_token', token);
          localStorage.setItem('caretaker_user', JSON.stringify(user));
        }
      },
      clearAuth: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('caretaker_token');
          localStorage.removeItem('caretaker_user');
        }
      },
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    { name: 'caretaker-auth' },
  ),
);
