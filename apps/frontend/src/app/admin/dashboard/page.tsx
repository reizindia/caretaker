'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Building2, Home, Package, ShoppingCart, Soup, TrendingUp, Users, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
  bg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="metric-card flex flex-col gap-3 p-4 sm:p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${iconColor}`}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-950">{value ?? 0}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { selectedFlat } = useAdminFlatStore();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', selectedFlat?.slug],
    queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  const { data: flatsData } = useQuery({
    queryKey: ['flats-count'],
    queryFn: () => apiClient.get('/flats').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <div className="mb-7 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_8px_32px_rgba(15,23,42,0.18)]">
        <div className="relative overflow-hidden p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-cyan-400/6 blur-2xl" />
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Super Admin</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                {selectedFlat ? `Live overview for ${selectedFlat.name}.` : 'Select an active flat from the sidebar.'}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                <p className="text-xs text-slate-500">Live modules</p>
                <p className="mt-0.5 text-xl font-bold flex items-center gap-1.5">6 <TrendingUp size={14} className="text-emerald-400" /></p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3">
                <p className="text-xs text-slate-500">Status</p>
                <p className="mt-0.5 text-xl font-bold text-emerald-400">Live</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageHeader title="Overview" description={selectedFlat ? `Key metrics for ${selectedFlat.name}` : 'Select an active flat from the sidebar'} />

      {/* ── Stats ── */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Flats" value={flatsData?.total || 0} icon={Building2} bg="bg-cyan-50" iconColor="text-cyan-700" />
        <StatCard label="Residents" value={data?.totalResidents || 0} icon={Users} bg="bg-emerald-50" iconColor="text-emerald-700" />
        <StatCard label="Grocery Orders" value={data?.groceryOrders || 0} icon={ShoppingCart} bg="bg-amber-50" iconColor="text-amber-700" />
        <StatCard label="Food Orders" value={data?.foodOrders || 0} icon={Soup} bg="bg-orange-50" iconColor="text-orange-700" />
        <StatCard label="Service Bookings" value={data?.serviceBookings || 0} icon={Wrench} bg="bg-indigo-50" iconColor="text-indigo-700" />
        <StatCard label="Gate Passes" value={data?.gatePasses || 0} icon={Home} bg="bg-rose-50" iconColor="text-rose-700" />
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Grocery Orders */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Package size={15} strokeWidth={2.2} />
            </div>
            <h2 className="text-sm font-bold text-slate-950">Recent Grocery Orders</h2>
          </div>
          {!data?.recentGroceryOrders?.length && (
            <p className="text-sm text-slate-400">No orders yet.</p>
          )}
          <div className="space-y-2">
            {data?.recentGroceryOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100/60">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.resident?.name}</p>
                  <p className="text-xs text-slate-400">Flat {order.resident?.flatNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-slate-900">₹{Number(order.totalAmount).toFixed(0)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Passes */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Home size={15} strokeWidth={2.2} />
            </div>
            <h2 className="text-sm font-bold text-slate-950">Recent Gate Passes</h2>
          </div>
          {!data?.recentGatePasses?.length && (
            <p className="text-sm text-slate-400">No gate passes yet.</p>
          )}
          <div className="space-y-2">
            {data?.recentGatePasses?.map((pass: any) => (
              <div key={pass.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100/60">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{pass.visitorName}</p>
                  <p className="text-xs text-slate-400">By {pass.resident?.name} · Flat {pass.resident?.flatNumber}</p>
                </div>
                <StatusBadge status={pass.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
