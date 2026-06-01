'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, KeyRound, Phone, Plus, User, X } from 'lucide-react';

export default function GatePassPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    visitorName: '',
    visitorPhone: '',
    purpose: '',
    expectedVisitDate: '',
    expectedVisitTime: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-gate-passes'],
    queryFn: () => apiClient.get('/gate-passes').then((r) => r.data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/gate-passes', form);
      toast.success('Gate pass requested!');
      setForm({ visitorName: '', visitorPhone: '', purpose: '', expectedVisitDate: '', expectedVisitTime: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-gate-passes'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.patch(`/gate-passes/${id}/${action}`);
      toast.success(action === 'approve' ? 'Pass approved!' : 'Pass rejected!');
      queryClient.invalidateQueries({ queryKey: ['my-gate-passes'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Gate Pass</h1>
          <p className="text-xs font-medium text-slate-400">Manage visitor access</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'btn-primary'
          }`}
        >
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Request Pass</>}
        </button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="card mb-5 p-5 animate-slide-up">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <KeyRound size={15} strokeWidth={2.2} />
            </div>
            <h2 className="text-sm font-bold text-slate-950">New Visitor Pass</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="label">Visitor Name *</label>
              <input
                className="input-field"
                required
                placeholder="Full name of visitor"
                value={form.visitorName}
                onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Visitor Phone</label>
              <input
                className="input-field"
                type="tel"
                placeholder="Phone number (optional)"
                value={form.visitorPhone}
                onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Purpose</label>
              <input
                className="input-field"
                placeholder="e.g. Family visit, Delivery, Meeting"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Expected Date *</label>
                <input
                  className="input-field"
                  type="date"
                  required
                  value={form.expectedVisitDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, expectedVisitDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Expected Time</label>
                <input
                  className="input-field"
                  type="time"
                  value={form.expectedVisitTime}
                  onChange={(e) => setForm({ ...form, expectedVisitTime: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Submitting...' : 'Request Gate Pass'}
            </button>
          </form>
        </div>
      )}

      {/* Passes List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.passes?.length ? (
        <EmptyState
          icon={<KeyRound size={26} />}
          title="No gate passes yet"
          description="Request a visitor pass to allow guests entry"
        />
      ) : (
        <div className="space-y-2.5">
          {data.passes.map((pass: any) => (
            <div key={pass.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Left: Visitor info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <User size={17} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{pass.visitorName}</p>
                    {pass.visitorPhone && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Phone size={10} /> {pass.visitorPhone}
                      </p>
                    )}
                    {pass.purpose && (
                      <p className="text-[11px] text-slate-400">{pass.purpose}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <CalendarDays size={11} />
                      <span>{pass.expectedVisitDate}</span>
                      {pass.expectedVisitTime && (
                        <>
                          <Clock size={11} />
                          <span>{pass.expectedVisitTime}</span>
                        </>
                      )}
                    </div>
                    {pass.entryTime && (
                      <p className="mt-1 text-[11px] font-medium text-emerald-600">
                        Entered: {new Date(pass.entryTime).toLocaleTimeString()}
                      </p>
                    )}
                    {pass.exitTime && (
                      <p className="text-[11px] text-slate-400">
                        Exited: {new Date(pass.exitTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                {/* Right: Status & Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={pass.status} />
                  {pass.status === 'PENDING' && (
                    <div className="flex gap-1.5 mt-1">
                      <button
                        onClick={() => doAction(pass.id, 'approve')}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => doAction(pass.id, 'reject')}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
