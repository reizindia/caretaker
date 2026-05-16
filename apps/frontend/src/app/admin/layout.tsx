'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import AdminSidebar from '@/components/layout/AdminSidebar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'SUPER_ADMIN') { router.push('/login'); }
  }, [token, user, router]);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="ml-72 min-h-screen flex-1">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
