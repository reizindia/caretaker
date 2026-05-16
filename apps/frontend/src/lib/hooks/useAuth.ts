'use client';
import { useAuthStore } from '@/lib/store/auth.store';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    setAuth(userData, access_token);
    return userData;
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const redirectByRole = (userData: any) => {
    switch (userData.role) {
      case 'SUPER_ADMIN': router.push('/admin/dashboard'); break;
      case 'FLAT_ASSOCIATION': router.push('/association/dashboard'); break;
      case 'SECURITY': router.push('/security/dashboard'); break;
      case 'RESIDENT': router.push('/resident/dashboard'); break;
      default: router.push('/login');
    }
  };

  return { user, token, login, logout, redirectByRole, isAuthenticated: !!token };
}
