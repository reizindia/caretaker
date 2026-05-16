'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Building2, Home, Package, ShoppingCart, Soup, Users, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{value ?? 0}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data),
  });

  const { data: flatsData } = useQuery({
    queryKey: ['flats-count'],
    queryFn: () => apiClient.get('/flats').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
        <div className="bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.28),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_54%,#155e75_100%)] p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Command center</p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal">Super Admin Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Platform overview across flats, residents, commerce, service operations, and gate activity.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-slate-400">Live modules</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-slate-400">Demo mode</p>
                <p className="text-2xl font-bold">On</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageHeader title="Overview" description="Key operating metrics" />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Flats" value={flatsData?.total || 0} icon={Building2} color="bg-cyan-50 text-cyan-700" />
        <StatCard label="Total Residents" value={data?.totalResidents || 0} icon={Users} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Grocery Orders" value={data?.groceryOrders || 0} icon={ShoppingCart} color="bg-amber-50 text-amber-700" />
        <StatCard label="Food Orders" value={data?.foodOrders || 0} icon={Soup} color="bg-orange-50 text-orange-700" />
        <StatCard label="Service Bookings" value={data?.serviceBookings || 0} icon={Wrench} color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Gate Passes" value={data?.gatePasses || 0} icon={Home} color="bg-rose-50 text-rose-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-950"><Package size={18} /> Recent Grocery Orders</h2>
          {data?.recentGroceryOrders?.length === 0 && <p className="text-sm text-slate-400">No orders yet</p>}
          <div className="space-y-3">
            {data?.recentGroceryOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.resident?.name}</p>
                  <p className="text-xs text-slate-500">Flat {order.resident?.flatNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">INR {Number(order.totalAmount).toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-950"><Home size={18} /> Recent Gate Passes</h2>
          {data?.recentGatePasses?.length === 0 && <p className="text-sm text-slate-400">No gate passes yet</p>}
          <div className="space-y-3">
            {data?.recentGatePasses?.map((pass: any) => (
              <div key={pass.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{pass.visitorName}</p>
                  <p className="text-xs text-slate-500">By {pass.resident?.name} / Flat {pass.resident?.flatNumber}</p>
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
