'use client';
import { useEffect } from 'react';
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
  const { user, token } = useAuthStore();
  const router = useRouter();
  const { tenant } = useTenant();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'SECURITY') { router.push('/login'); }
  }, [token, user, router]);

  if (!user || user.role !== 'SECURITY') return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950 px-4 py-3 text-white shadow-xl shadow-slate-950/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
              <ShieldCheck size={19} />
            </div>
            <div>
              <p className="text-sm font-bold">{tenant?.flatName || user?.flat?.name}</p>
              <p className="text-xs text-slate-400">Security / {user.name}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl pb-28">{children}</main>
      <MobileNav items={navItems} basePath="/security" />
    </div>
  );
}
