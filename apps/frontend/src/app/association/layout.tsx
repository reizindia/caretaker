'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import Link from 'next/link';
import { useTenant } from '@/lib/hooks/useTenant';
import BrandMark from '@/components/shared/BrandMark';
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
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useTenant();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'FLAT_ASSOCIATION') { router.push('/login'); }
  }, [token, user, router]);

  if (!user || user.role !== 'FLAT_ASSOCIATION') return null;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="border-b border-slate-200/80 p-5">
          <BrandMark label={tenant?.flatName || user?.flat?.name || 'CareTaker'} subtitle="Association office" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200/80 p-4">
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-600">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
