'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import MobileNav from '@/components/layout/MobileNav';
import { useTenant } from '@/lib/hooks/useTenant';
import { Home, KeyRound, ShoppingCart, Soup, Wrench } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/resident/dashboard', icon: Home },
  { label: 'Grocery', href: '/resident/grocery', icon: ShoppingCart },
  { label: 'Food', href: '/resident/food', icon: Soup },
  { label: 'Services', href: '/resident/services', icon: Wrench },
  { label: 'Gate Pass', href: '/resident/gate-pass', icon: KeyRound },
];

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const { tenant } = useTenant();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'RESIDENT') { router.push('/login'); }
  }, [token, user, router]);

  if (!user || user.role !== 'RESIDENT') return null;

  return (
    <div className="min-h-screen" style={{ '--color-primary': tenant?.themeColor || '#0F172A' } as React.CSSProperties}>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.flatName} className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              {(tenant?.flatName || user?.flat?.name || 'A')[0]}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-950">{tenant?.flatName || user?.flat?.name || 'CareTaker'}</p>
            <p className="text-xs font-medium text-slate-500">{user.name} / Flat {user.flatNumber}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-screen max-w-4xl pb-28">{children}</main>
      <MobileNav items={navItems} basePath="/resident" />
    </div>
  );
}
