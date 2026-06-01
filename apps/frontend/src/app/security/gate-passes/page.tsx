'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gate Passes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {showForm ? 'Cancel' : '+ Initiate Pass'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-5 p-5 border border-indigo-100 bg-indigo-50/20 rounded-2xl animate-fade-in">
          <h2 className="text-sm font-bold text-slate-950 mb-3">Initiate Visitor Gate Pass</h2>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="label text-xs font-bold text-slate-700">Search Resident (Name or Flat) *</label>
              <input
                className="input-field mt-1"
                placeholder="Type name or flat to search..."
                value={searchQuery}
                onChange={(e) => handleSearchResident(e.target.value)}
              />
              {searchingResidents && <p className="text-[11px] text-gray-500 mt-1">Searching...</p>}
              {residents.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto border border-gray-200 bg-white rounded-lg shadow-sm divide-y">
                  {residents.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, residentId: r.id });
                        setSearchQuery(`${r.name} (Flat ${r.flatNumber || 'N/A'})`);
                        setResidents([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-800">{r.name}</span>
                      <span className="text-gray-500 text-[11px]">Flat: {r.flatNumber || 'N/A'}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.residentId && !residents.length && (
                <p className="text-[11px] text-green-600 font-medium mt-1">✓ Resident selected</p>
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

            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 mt-2">
              {loading ? 'Initiating...' : 'Initiate Pass'}
            </button>
          </form>
        </div>
      )}
      <input className="input-field mb-3" placeholder="Search by visitor name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['PENDING', 'APPROVED', 'ENTERED', 'EXITED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : !data?.passes?.length ? (
        <EmptyState title={`No ${statusFilter.toLowerCase()} gate passes`} />
      ) : (
        <div className="space-y-3">
          {data.passes.map((pass: any) => (
            <div key={pass.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{pass.visitorName}</p>
                  {pass.visitorPhone && <p className="text-sm text-gray-500">📞 {pass.visitorPhone}</p>}
                  {pass.purpose && <p className="text-sm text-gray-500">Purpose: {pass.purpose}</p>}
                  <p className="text-xs text-gray-400 mt-1">Resident: {pass.resident?.name} · Flat {pass.resident?.flatNumber}</p>
                  <p className="text-xs text-gray-400">📅 {pass.expectedVisitDate} {pass.expectedVisitTime && `at ${pass.expectedVisitTime}`}</p>
                  {pass.entryTime && <p className="text-xs text-green-600 mt-1">Entry: {new Date(pass.entryTime).toLocaleTimeString()}</p>}
                  {pass.exitTime && <p className="text-xs text-gray-500">Exit: {new Date(pass.exitTime).toLocaleTimeString()}</p>}
                </div>
                <StatusBadge status={pass.status} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {pass.status === 'PENDING' && (
                  <>
                    <button onClick={() => doAction(pass.id, 'approve')} className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg">Approve</button>
                    <button onClick={() => doAction(pass.id, 'reject')} className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg">Reject</button>
                  </>
                )}
                {pass.status === 'APPROVED' && <button onClick={() => doAction(pass.id, 'entry')} className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg">Mark Entry</button>}
                {pass.status === 'ENTERED' && <button onClick={() => doAction(pass.id, 'exit')} className="bg-gray-700 text-white text-xs px-4 py-2 rounded-lg">Mark Exit</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
