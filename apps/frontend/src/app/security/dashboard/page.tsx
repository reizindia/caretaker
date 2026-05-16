'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { ArrowRight, ClipboardList, KeyRound, ShieldCheck } from 'lucide-react';

export default function SecurityDashboard() {
  const { data: pending } = useQuery({ queryKey: ['security-pending'], queryFn: () => apiClient.get('/gate-passes?status=PENDING').then((r) => r.data) });
  const { data: approved } = useQuery({ queryKey: ['security-approved'], queryFn: () => apiClient.get('/gate-passes?status=APPROVED').then((r) => r.data) });
  const { data: entered } = useQuery({ queryKey: ['security-entered'], queryFn: () => apiClient.get('/gate-passes?status=ENTERED').then((r) => r.data) });

  const stats = [
    { label: 'Pending', value: pending?.passes?.length || 0, color: 'text-amber-700 bg-amber-50' },
    { label: 'Approved', value: approved?.passes?.length || 0, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Inside', value: entered?.passes?.length || 0, color: 'text-cyan-700 bg-cyan-50' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <section className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-200">Security desk</p>
            <h1 className="text-3xl font-bold tracking-normal">Gate operations</h1>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card text-center">
            <p className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/security/gate-passes" className="card group flex items-center justify-between active:scale-95">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <KeyRound size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-950">Manage Gate Passes</p>
              {(pending?.passes?.length || 0) > 0 && <p className="mt-1 text-xs font-semibold text-rose-600">{pending.passes.length} pending approvals</p>}
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-0.5" />
        </Link>
        <Link href="/security/visitor-history" className="card group flex items-center justify-between active:scale-95">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-950">Visitor History</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Review entries and exits</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
