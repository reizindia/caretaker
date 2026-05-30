'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import { useAuth } from '@/lib/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';
import BrandMark from '@/components/shared/BrandMark';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import apiClient from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, BellDot, Building2, CalendarClock, ClipboardList,
  Home, LogOut, Package, Settings, ShieldCheck,
  ShoppingCart, Soup, UserCog, Users, Utensils, Wrench,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Flats / Apartments', href: '/admin/flats', icon: Building2 },
  { label: 'Residents', href: '/admin/residents', icon: Users },
  { label: 'Security Users', href: '/admin/security-users', icon: ShieldCheck },
  { label: 'Association Users', href: '/admin/association-users', icon: UserCog },
  { label: 'Grocery Items', href: '/admin/grocery', icon: ShoppingCart },
  { label: 'Grocery Orders', href: '/admin/grocery/orders', icon: Package },
  { label: 'Item Requests', href: '/admin/grocery/requests', icon: ClipboardList },
  { label: 'Hotels', href: '/admin/hotels', icon: Utensils },
  { label: 'Food Orders', href: '/admin/food-orders', icon: Soup },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Time Slots', href: '/admin/time-slots', icon: CalendarClock },
  { label: 'Service Bookings', href: '/admin/service-bookings', icon: BellDot },
  { label: 'Gate Passes', href: '/admin/gate-passes', icon: Home },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const { selectedFlat, setSelectedFlat } = useAdminFlatStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'SUPER_ADMIN') { router.push('/login'); }
  }, [token, user, router, mounted]);

  const { data: flatsData } = useQuery({
    queryKey: ['flats-select'],
    queryFn: () => apiClient.get('/flats').then((r) => r.data),
    enabled: mounted && user?.role === 'SUPER_ADMIN',
  });

  const flats = flatsData?.flats || [];

  useEffect(() => {
    if (!flats.length) return;
    if (!selectedFlat || !flats.some((flat: any) => flat.id === selectedFlat.id)) {
      const first = flats[0];
      setSelectedFlat({ id: first.id, name: first.name, slug: first.slug });
    }
  }, [flats, selectedFlat, setSelectedFlat]);

  if (!mounted || !user || user.role !== 'SUPER_ADMIN') {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <AppShell
      navItems={navItems}
      activeStyle="bg-white text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      inactiveStyle="text-slate-400 hover:bg-white/8 hover:text-white"
      sidebarBg="bg-slate-950"
      header={
        <div className="flex min-w-0 flex-col gap-3">
          <BrandMark tone="dark" subtitle="Admin suite" />
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/6 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 text-xs font-bold text-white">
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="truncate text-xs text-slate-500">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-300"
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
