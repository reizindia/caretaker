'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import MobileNav from '@/components/layout/MobileNav';
import { useTenant } from '@/lib/hooks/useTenant';
import { ClipboardList, Home, KeyRound, LogOut, ShieldCheck } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/security/dashboard', icon: Home },
  { label: 'Gate Passes', href: '/security/gate-passes', icon: KeyRound },
  { label: 'History', href: '/security/visitor-history', icon: ClipboardList },
];

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const { user, token, clearAuth } = useAuthStore();
  const router = useRouter();
  const { tenant } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'SECURITY') { router.push('/login'); }
  }, [token, user, router, mounted]);

  if (!mounted || !user || user.role !== 'SECURITY') return null;

  const flatImage = tenant?.imageUrl || user.flat?.imageUrl;
  const flatName = tenant?.flatName || user?.flat?.name || 'CareTaker';

  return (
    <div className="min-h-screen">
      {/* Security Header */}
      <header
        className="sticky top-0 z-30 border-b border-white/8 bg-slate-950 px-4 py-0 text-white"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {flatImage ? (
              <img src={flatImage} alt={flatName} className="h-9 w-9 flex-shrink-0 rounded-xl object-cover ring-1 ring-white/10" />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-400">
                <ShieldCheck size={17} strokeWidth={2.2} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">{flatName}</p>
              <p className="text-[11px] font-medium leading-tight text-slate-500">Security · {user.name}</p>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl pb-28">{children}</main>
      <MobileNav items={navItems} basePath="/security" />
    </div>
  );
}
