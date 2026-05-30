'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import StatusBadge from '@/components/shared/StatusBadge';
import {
  ArrowRight,
  CalendarClock,
  Home,
  KeyRound,
  Package,
  ShoppingCart,
  Soup,
  Store,
  Wrench,
} from 'lucide-react';

const quickLinks = [
  {
    label: 'Grocery',
    href: '/resident/grocery',
    icon: ShoppingCart,
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    border: 'border-emerald-100',
    text: 'text-emerald-800',
  },
  {
    label: 'Food',
    href: '/resident/food',
    icon: Soup,
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-700',
    border: 'border-orange-100',
    text: 'text-orange-800',
  },
  {
    label: 'Flee Market',
    href: '/resident/market',
    icon: Store,
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
    border: 'border-violet-100',
    text: 'text-violet-800',
  },
  {
    label: 'Services',
    href: '/resident/services',
    icon: Wrench,
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    border: 'border-sky-100',
    text: 'text-sky-800',
  },
  {
    label: 'Gate Pass',
    href: '/resident/gate-pass',
    icon: KeyRound,
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    border: 'border-indigo-100',
    text: 'text-indigo-800',
  },
  {
    label: 'My Orders',
    href: '/resident/orders',
    icon: Package,
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    border: 'border-amber-100',
    text: 'text-amber-800',
  },
];

export default function ResidentDashboard() {
  const { user } = useAuthStore();
  const { data: groceryOrders } = useQuery({ queryKey: ['my-grocery-orders'], queryFn: () => apiClient.get('/grocery/orders?limit=1').then((r) => r.data) });
  const { data: foodOrders } = useQuery({ queryKey: ['my-food-orders'], queryFn: () => apiClient.get('/food/orders?limit=1').then((r) => r.data) });
  const { data: bookings } = useQuery({ queryKey: ['my-bookings'], queryFn: () => apiClient.get('/service-bookings?limit=1').then((r) => r.data) });
  const { data: gatePasses } = useQuery({ queryKey: ['my-gate-passes'], queryFn: () => apiClient.get('/gate-passes?limit=1').then((r) => r.data) });

  const activity = [
    groceryOrders?.orders?.[0] && {
      id: `grocery-${groceryOrders.orders[0].id}`,
      title: 'Grocery order',
      meta: new Date(groceryOrders.orders[0].createdAt).toLocaleDateString(),
      status: groceryOrders.orders[0].status,
      icon: ShoppingCart,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    foodOrders?.orders?.[0] && {
      id: `food-${foodOrders.orders[0].id}`,
      title: `Food / ${foodOrders.orders[0].hotel?.name || 'Hotel'}`,
      meta: new Date(foodOrders.orders[0].createdAt).toLocaleDateString(),
      status: foodOrders.orders[0].status,
      icon: Soup,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    bookings?.bookings?.[0] && {
      id: `booking-${bookings.bookings[0].id}`,
      title: bookings.bookings[0].service?.name,
      meta: bookings.bookings[0].timeSlot?.date,
      status: bookings.bookings[0].status,
      icon: Wrench,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
    },
    gatePasses?.passes?.[0] && {
      id: `pass-${gatePasses.passes[0].id}`,
      title: gatePasses.passes[0].visitorName,
      meta: gatePasses.passes[0].expectedVisitDate,
      status: gatePasses.passes[0].status,
      icon: KeyRound,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ].filter(Boolean) as Array<{
    id: string; title: string; meta: string; status: string;
    icon: typeof Home; iconBg: string; iconColor: string;
  }>;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-6 animate-fade-in">

      {/* ── Hero Section ── */}
      <section className="mb-5 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_8px_32px_rgba(15,23,42,0.18)]">
        <div className="relative overflow-hidden p-5 sm:p-6">
          {/* Decorative gradients */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full bg-cyan-400/8 blur-2xl" />

          {/* Greeting */}
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Welcome back</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Hey, {firstName} 👋
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Manage everything from your apartment hub.
          </p>

          {/* Flat info pill */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Home size={13} className="text-slate-400" />
            <span>Flat {user?.flatNumber || '—'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{user?.flat?.name || 'Your society'}</span>
          </div>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <div className="mb-5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex flex-col items-center justify-center gap-2.5 rounded-2xl border ${link.border} ${link.bg} p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.96]`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.iconBg} ${link.iconColor} transition-transform duration-200 group-hover:scale-105`}>
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <span className={`text-[11px] font-semibold ${link.text}`}>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Recent Activity ── */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <CalendarClock size={15} strokeWidth={2.2} />
            </div>
            <h2 className="text-sm font-bold text-slate-950">Recent Activity</h2>
          </div>
          <Link
            href="/resident/orders"
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-950"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {activity.length === 0 ? (
          <div className="empty-state py-8">
            <p className="text-sm font-medium text-slate-400">No recent activity yet.</p>
            <p className="text-xs text-slate-300">Place an order or book a service to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100/60">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
                      <Icon size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.meta}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
