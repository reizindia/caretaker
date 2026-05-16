'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import BrandMark from '@/components/shared/BrandMark';
import {
  BarChart3,
  BellDot,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Soup,
  UserCog,
  Users,
  Utensils,
  Wrench,
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
  { label: 'Documentation', href: '/admin/documentation', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/70 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
      <div className="border-b border-white/10 p-5">
        <BrandMark tone="dark" subtitle="Super admin suite" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-2xl bg-white/10 p-3">
          <div className="text-sm font-semibold">{user?.name || 'Demo Admin'}</div>
          <div className="text-xs text-slate-400">{user?.email || 'admin@caretaker.com'}</div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100">
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
