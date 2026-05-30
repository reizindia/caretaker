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
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 text-white"
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}
    >
      {/* Brand */}
      <div className="border-b border-white/8 px-5 py-4">
        <BrandMark tone="dark" subtitle="Admin suite" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-white/6 text-slate-500 group-hover:bg-white/12 group-hover:text-white'
              }`}>
                <Icon size={15} strokeWidth={2.2} />
              </div>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/8 p-4 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-white/6 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 text-xs font-bold text-white">
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</div>
            <div className="truncate text-xs text-slate-500">{user?.email || ''}</div>
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
    </aside>
  );
}
