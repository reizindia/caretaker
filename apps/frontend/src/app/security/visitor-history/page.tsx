'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Search, Calendar, Phone, User, Clock } from 'lucide-react';

export default function VisitorHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visitor-history', search, statusFilter],
    queryFn: () => apiClient.get(`/gate-passes?${statusFilter ? 'status=' + statusFilter + '&' : ''}search=${search}`).then((r) => r.data),
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visitor History</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Chronological history log of society visitors and activities</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3.5 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            className="input-field pl-9"
            placeholder="Search visitor name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['', 'ENTERED', 'EXITED', 'APPROVED', 'REJECTED'].map((s) => {
            const isActive = statusFilter === s;
            let activeStyles = 'bg-slate-950 text-white shadow-sm';
            if (s === 'PENDING') activeStyles = 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm';
            if (s === 'APPROVED') activeStyles = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm';
            if (s === 'ENTERED') activeStyles = 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-sm';
            if (s === 'EXITED') activeStyles = 'bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-sm';
            if (s === 'REJECTED') activeStyles = 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-sm';

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase border transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? `${activeStyles} scale-[1.02]`
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {s === '' ? 'All logs' : s === 'ENTERED' ? 'Inside' : s === 'EXITED' ? 'Exited' : s.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* History timeline feed */}
      {isLoading ? (
        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
      ) : !data?.passes?.length ? (
        <EmptyState title="No visitor records found" />
      ) : (
        <div className="space-y-4">
          {data.passes.map((pass: any) => (
            <div
              key={pass.id}
              className="card-padded relative overflow-hidden group border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 animate-fade-in"
            >
              {/* Left visual accent line based on status */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                pass.status === 'PENDING' ? 'bg-amber-400' :
                pass.status === 'APPROVED' ? 'bg-emerald-400' :
                pass.status === 'ENTERED' ? 'bg-blue-400' :
                pass.status === 'EXITED' ? 'bg-slate-300' : 'bg-rose-400'
              }`} />

              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate leading-tight group-hover:text-black transition-colors">{pass.visitorName}</h3>
                  <div className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                    {pass.visitorPhone && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">📞</span> {pass.visitorPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">🏢</span> <span className="text-slate-600 font-bold">Resident:</span> {pass.resident?.name} · <span className="text-slate-700 font-bold">Flat {pass.resident?.flatNumber}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">📅</span> <span className="font-semibold text-slate-600">Expected Visit:</span> {pass.expectedVisitDate} {pass.expectedVisitTime && <span className="text-slate-400 font-normal">at {pass.expectedVisitTime}</span>}
                    </span>
                  </div>

                  {(pass.entryTime || pass.exitTime) && (
                    <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs border-t border-dashed border-slate-100 mt-2">
                      {pass.entryTime && (
                        <p className="font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Entry: {new Date(pass.entryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                      {pass.exitTime && (
                        <p className="font-semibold text-slate-500 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Exit: {new Date(pass.exitTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={pass.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
