'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusBadge from '@/components/shared/StatusBadge';
import { Home, Package, ShoppingCart, Soup, Users, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const stats: Array<{ label: string; key: string; icon: LucideIcon; color: string }> = [
  { label: 'Residents', key: 'totalResidents', icon: Users, color: 'bg-cyan-50 text-cyan-700' },
  { label: 'Grocery Orders', key: 'groceryOrders', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Food Orders', key: 'foodOrders', icon: Soup, color: 'bg-orange-50 text-orange-700' },
  { label: 'Service Bookings', key: 'serviceBookings', icon: Wrench, color: 'bg-indigo-50 text-indigo-700' },
  { label: 'Gate Passes', key: 'gatePasses', icon: Home, color: 'bg-rose-50 text-rose-700' },
];

export default function AssociationDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['assoc-dashboard'], queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data) });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <section className="mb-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Association workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">Apartment overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Track orders, residents, services, and visitor flow for your society in one place.</p>
      </section>

      <PageHeader title="Today at a glance" description="Current operating counts" />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="metric-card">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${s.color}`}>
                <Icon size={22} />
              </div>
              <div className="text-3xl font-bold text-slate-950">{data?.[s.key] || 0}</div>
              <div className="text-sm font-semibold text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-950"><Package size={18} /> Recent Grocery Orders</h2>
          {!data?.recentGroceryOrders?.length ? <p className="text-sm text-slate-400">No orders yet</p> : (
            <div className="space-y-2">
              {data.recentGroceryOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-700">{o.resident?.name} / Flat {o.resident?.flatNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-950"><Home size={18} /> Recent Gate Passes</h2>
          {!data?.recentGatePasses?.length ? <p className="text-sm text-slate-400">No passes yet</p> : (
            <div className="space-y-2">
              {data.recentGatePasses.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-700">{p.visitorName}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
