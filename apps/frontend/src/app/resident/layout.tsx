'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import MobileNav from '@/components/layout/MobileNav';
import { useTenant } from '@/lib/hooks/useTenant';
import { Home, KeyRound, ShoppingCart, Soup, Store, Wrench, UserCircle2 } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/resident/dashboard', icon: Home },
  { label: 'Grocery', href: '/resident/grocery', icon: ShoppingCart },
  { label: 'Food', href: '/resident/food', icon: Soup },
  { label: 'Flee', href: '/resident/market', icon: Store },
  { label: 'Services', href: '/resident/services', icon: Wrench },
  { label: 'Gate Pass', href: '/resident/gate-pass', icon: KeyRound },
];

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const { tenant } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'RESIDENT') { router.push('/login'); }
  }, [token, user, router, mounted]);

  if (!mounted || !user || user.role !== 'RESIDENT') return null;

  const flatImage = tenant?.imageUrl || user.flat?.imageUrl;
  const flatName = tenant?.flatName || user?.flat?.name || 'CareTaker';

  return (
    <div className="min-h-screen" style={{ '--color-primary': tenant?.themeColor || '#0F172A' } as React.CSSProperties}>
      {/* Premium sticky header */}
      <header
        className="sticky top-0 z-30 border-b border-slate-100 bg-white px-4 py-0"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3">
          {/* Left: Logo + Society Name */}
          <div className="flex items-center gap-3 min-w-0">
            {flatImage ? (
              <img
                src={flatImage}
                alt={flatName}
                className="h-9 w-9 rounded-xl object-cover shadow-sm ring-1 ring-slate-200 flex-shrink-0"
              />
            ) : tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={flatName}
                className="h-8 w-8 rounded-lg object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white shadow-sm">
                {flatName[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 leading-tight">
                {flatName}
              </p>
              <p className="truncate text-[11px] font-medium text-slate-400 leading-tight">
                {user.name} &middot; Flat {user.flatNumber}
              </p>
            </div>
          </div>

          {/* Right: Profile */}
          <Link
            href="/resident/profile"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-white hover:text-slate-800 hover:shadow-md"
          >
            <UserCircle2 size={18} strokeWidth={2} />
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-screen max-w-4xl pb-28">{children}</main>
      <MobileNav items={navItems} basePath="/resident" />
    </div>
  );
}
