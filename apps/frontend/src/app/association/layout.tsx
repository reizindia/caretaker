'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useTenant } from '@/lib/hooks/useTenant';
import AppShell from '@/components/layout/AppShell';
import { BarChart3, ClipboardList, Home, LogOut, Package, Users, Wrench } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/association/dashboard', icon: BarChart3 },
  { label: 'Orders', href: '/association/orders', icon: Package },
  { label: 'Services', href: '/association/services', icon: Wrench },
  { label: 'Gate Pass', href: '/association/gate-passes', icon: Home },
  { label: 'Residents', href: '/association/residents', icon: Users },
  { label: 'Reports', href: '/association/reports', icon: ClipboardList },
];

export default function AssociationLayout({ children }: { children: React.ReactNode }) {
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
    if (user?.role !== 'FLAT_ASSOCIATION') { router.push('/login'); }
  }, [token, user, router, mounted]);

  if (!mounted || !user || user.role !== 'FLAT_ASSOCIATION') return null;

  const flatImage = tenant?.imageUrl || user.flat?.imageUrl;
  const flatName = tenant?.flatName || user?.flat?.name || 'CareTaker';

  return (
    <AppShell
      navItems={navItems}
      activeStyle="bg-slate-950 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
      inactiveStyle="text-slate-500 hover:bg-slate-100 hover:text-slate-950"
      sidebarBg="bg-white border-r border-slate-100"
      header={
        <div className="flex min-w-0 items-center gap-2.5">
          {flatImage ? (
            <img src={flatImage} alt={flatName} className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              {flatName[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-bold leading-tight text-slate-950">{flatName}</div>
            <div className="truncate text-[11px] font-medium leading-tight text-slate-400">Association portal</div>
          </div>
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">{user.name}</div>
              <div className="truncate text-xs text-slate-400">{user.email}</div>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/login'); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 transition-all duration-150 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
