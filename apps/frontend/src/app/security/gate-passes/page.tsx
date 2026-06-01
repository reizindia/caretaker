'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';
import { Search, Plus, Check, X, LogIn, LogOut, Phone, Calendar, ClipboardList } from 'lucide-react';

export default function SecurityGatePassesPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Form states for initiating gate pass
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    residentId: '',
    visitorName: '',
    visitorPhone: '',
    purpose: '',
  });

  // Autocomplete resident states
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState<any[]>([]);
  const [searchingResidents, setSearchingResidents] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['security-gate-passes', statusFilter, search],
    queryFn: () => apiClient.get(`/gate-passes?status=${statusFilter}&search=${search}`).then((r) => r.data),
    refetchInterval: 30000,
  });

  const doAction = async (id: string, action: 'approve' | 'reject' | 'entry' | 'exit') => {
    try {
      await apiClient.patch(`/gate-passes/${id}/${action}`);
      toast.success(action === 'approve' ? 'Pass approved' : action === 'reject' ? 'Pass rejected' : action === 'entry' ? 'Entry marked' : 'Exit marked');
      queryClient.invalidateQueries({ queryKey: ['security-gate-passes'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const handleSearchResident = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setResidents([]);
      return;
    }
    setSearchingResidents(true);
    try {
      const res = await apiClient.get(`/users?role=RESIDENT&search=${query}`);
      setResidents(res.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingResidents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentId) {
      toast.error('Please select a resident');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      await apiClient.post('/gate-passes', {
        ...form,
        expectedVisitDate: today,
        expectedVisitTime: now,
      });
      toast.success('Gate pass initiated!');
      setForm({ residentId: '', visitorName: '', visitorPhone: '', purpose: '' });
      setSearchQuery('');
      setResidents([]);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['security-gate-passes'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initiate pass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gate Passes</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Approve visitors and register entry/exit operations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus size={16} strokeWidth={2.4} /> Initiate Pass</>}
        </button>
      </div>

      {showForm && (
        <div className="panel mb-6 p-6 border border-indigo-100 bg-indigo-50/15 rounded-2xl animate-fade-in">
          <h2 className="text-sm font-bold text-slate-950 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Initiate Visitor Gate Pass
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="label text-xs font-bold text-slate-700">Search Resident (Name or Flat) *</label>
                <input
                  className="input-field mt-1"
                  placeholder="Type name or flat to search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchResident(e.target.value)}
                />
                {searchingResidents && <p className="text-[11px] text-slate-400 mt-1 animate-pulse">Searching...</p>}
                {residents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1.5 max-h-48 overflow-y-auto border border-slate-150 bg-white rounded-xl shadow-lg divide-y divide-slate-50">
                    {residents.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, residentId: r.id });
                          setSearchQuery(`${r.name} (Flat ${r.flatNumber || 'N/A'})`);
                          setResidents([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 flex justify-between items-center transition-colors"
                      >
                        <span className="font-semibold text-slate-850">{r.name}</span>
                        <span className="text-slate-400 text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md">Flat: {r.flatNumber || 'N/A'}</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.residentId && !residents.length && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />✓ Resident selected
                  </p>
                )}
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Visitor Name *</label>
                <input
                  className="input-field mt-1"
                  required
                  placeholder="Full name of visitor"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Visitor Phone</label>
                <input
                  className="input-field mt-1"
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={form.visitorPhone}
                  onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Purpose</label>
                <input
                  className="input-field mt-1"
                  placeholder="e.g. Delivery, Maintenance, Guest"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-100/50 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Initiating...' : 'Initiate Pass'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search Section */}
      <div className="space-y-3.5 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            className="input-field pl-9"
            placeholder="Search by visitor name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['PENDING', 'APPROVED', 'ENTERED', 'EXITED', 'REJECTED'].map((s) => {
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
                {s === 'ENTERED' ? 'Inside' : s === 'EXITED' ? 'Exited' : s.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><LoadingSpinner /></div>
      ) : !data?.passes?.length ? (
        <EmptyState title={`No ${statusFilter.toLowerCase()} gate passes`} />
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

              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate leading-tight group-hover:text-black transition-colors">{pass.visitorName}</h3>
                  <div className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                    {pass.visitorPhone && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">📞</span> {pass.visitorPhone}
                      </span>
                    )}
                    {pass.purpose && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">📌</span> <span className="font-bold text-slate-700">Purpose:</span> {pass.purpose}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">🏢</span> <span className="text-slate-600 font-bold">Resident:</span> {pass.resident?.name} · <span className="text-slate-700 font-bold">Flat {pass.resident?.flatNumber}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">📅</span> <span className="font-semibold text-slate-600">{pass.expectedVisitDate}</span> {pass.expectedVisitTime && <span className="text-slate-400 font-normal">at {pass.expectedVisitTime}</span>}
                    </span>
                  </div>
                  {(pass.entryTime || pass.exitTime) && (
                    <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs border-t border-dashed border-slate-100 mt-2">
                      {pass.entryTime && (
                        <p className="font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Entry: {new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {pass.exitTime && (
                        <p className="font-semibold text-slate-500 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Exit: {new Date(pass.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={pass.status} />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pt-3 border-t border-slate-100/80">
                {pass.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => doAction(pass.id, 'approve')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96]"
                    >
                      <Check size={13} strokeWidth={2.5} /> Approve Pass
                    </button>
                    <button
                      onClick={() => doAction(pass.id, 'reject')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-600 text-xs font-bold px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96]"
                    >
                      <X size={13} strokeWidth={2.5} /> Reject
                    </button>
                  </>
                )}
                {pass.status === 'APPROVED' && (
                  <button
                    onClick={() => doAction(pass.id, 'entry')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96]"
                  >
                    <LogIn size={13} strokeWidth={2.5} /> Mark Entry
                  </button>
                )}
                {pass.status === 'ENTERED' && (
                  <button
                    onClick={() => doAction(pass.id, 'exit')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96]"
                  >
                    <LogOut size={13} strokeWidth={2.5} /> Mark Exit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
