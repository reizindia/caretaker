'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import BrandMark from '@/components/shared/BrandMark';

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'SUPER_ADMIN': router.push('/admin/dashboard'); break;
        case 'FLAT_ASSOCIATION': router.push('/association/dashboard'); break;
        case 'SECURITY': router.push('/security/dashboard'); break;
        case 'RESIDENT': router.push('/resident/dashboard'); break;
        default: router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl shadow-slate-950/25 backdrop-blur">
        <BrandMark size="lg" tone="dark" />
        <div className="mx-auto mt-6 h-9 w-9 animate-spin rounded-full border-4 border-white/30 border-t-cyan-300" />
      </div>
    </div>
  );
}
