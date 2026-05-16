'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import StatusBadge from '@/components/shared/StatusBadge';
import { ArrowRight, CalendarClock, Home, KeyRound, Package, ShoppingCart, Soup, Wrench } from 'lucide-react';

const quickLinks = [
  { label: 'Grocery', href: '/resident/grocery', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'Food', href: '/resident/food', icon: Soup, color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { label: 'Services', href: '/resident/services', icon: Wrench, color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { label: 'Gate Pass', href: '/resident/gate-pass', icon: KeyRound, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { label: 'My Orders', href: '/resident/orders', icon: Package, color: 'bg-amber-50 text-amber-700 border-amber-100' },
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
    },
    foodOrders?.orders?.[0] && {
      id: `food-${foodOrders.orders[0].id}`,
      title: `Food order / ${foodOrders.orders[0].hotel?.name || 'Hotel'}`,
      meta: new Date(foodOrders.orders[0].createdAt).toLocaleDateString(),
      status: foodOrders.orders[0].status,
      icon: Soup,
    },
    bookings?.bookings?.[0] && {
      id: `booking-${bookings.bookings[0].id}`,
      title: bookings.bookings[0].service?.name,
      meta: bookings.bookings[0].timeSlot?.date,
      status: bookings.bookings[0].status,
      icon: Wrench,
    },
    gatePasses?.passes?.[0] && {
      id: `pass-${gatePasses.passes[0].id}`,
      title: gatePasses.passes[0].visitorName,
      meta: gatePasses.passes[0].expectedVisitDate,
      status: gatePasses.passes[0].status,
      icon: KeyRound,
    },
  ].filter(Boolean) as Array<{ id: string; title: string; meta: string; status: string; icon: typeof Home }>;

  return (
    <div className="p-4 sm:p-6">
      <section className="mb-6 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-950/15">
        <div className="bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.3),transparent_26%),linear-gradient(135deg,#0f172a_0%,#164e63_100%)] p-6">
          <p className="text-sm font-semibold text-cyan-200">Good day, {user?.name?.split(' ')[0]}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">Your apartment hub</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Order essentials, book services, and create visitor passes from one clean resident workspace.</p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm backdrop-blur">
            <Home size={18} className="text-cyan-200" />
            <span className="font-medium">Flat {user?.flatNumber || '--'}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{user?.flat?.name || 'Demo Society'}</span>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={`group flex min-h-28 flex-col justify-between rounded-2xl border p-4 transition active:scale-95 ${link.color}`}>
              <Icon size={24} strokeWidth={2.2} />
              <span className="flex items-center justify-between text-sm font-bold">
                {link.label}
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-slate-950"><CalendarClock size={18} /> Recent Activity</h2>
          <Link href="/resident/orders" className="text-sm font-semibold text-cyan-700">View orders</Link>
        </div>
        <div className="space-y-3">
          {activity.length === 0 && <p className="text-sm text-slate-400">No recent activity yet.</p>}
          {activity.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.meta}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
