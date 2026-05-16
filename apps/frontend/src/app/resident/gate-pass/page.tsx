'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function GatePassPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ visitorName: '', visitorPhone: '', purpose: '', expectedVisitDate: '', expectedVisitTime: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['my-gate-passes'], queryFn: () => apiClient.get('/gate-passes').then((r) => r.data) });

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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gate Pass</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">+ Request Pass</button>
      </div>

      {showForm && (
        <div className="card mb-4 border-2 border-blue-200">
          <h2 className="font-bold mb-3">New Visitor Pass</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">Visitor Name *</label><input className="input-field" required value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Visitor Phone</label><input className="input-field" value={form.visitorPhone} onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Purpose</label><input className="input-field" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Family visit, Delivery" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Expected Date *</label><input className="input-field" type="date" required value={form.expectedVisitDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, expectedVisitDate: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Expected Time</label><input className="input-field" type="time" value={form.expectedVisitTime} onChange={(e) => setForm({ ...form, expectedVisitTime: e.target.value })} /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Request Gate Pass'}</button>
          </form>
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : !data?.passes?.length ? (
        <EmptyState title="No gate passes yet" description="Request a pass for your visitors" />
      ) : (
        <div className="space-y-3">
          {data.passes.map((pass: any) => (
            <div key={pass.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{pass.visitorName}</p>
                  {pass.visitorPhone && <p className="text-xs text-gray-500">📞 {pass.visitorPhone}</p>}
                  {pass.purpose && <p className="text-xs text-gray-500">Purpose: {pass.purpose}</p>}
                  <p className="text-xs text-gray-400 mt-1">📅 {pass.expectedVisitDate} {pass.expectedVisitTime && `at ${pass.expectedVisitTime}`}</p>
                  {pass.entryTime && <p className="text-xs text-green-600">Entry: {new Date(pass.entryTime).toLocaleTimeString()}</p>}
                  {pass.exitTime && <p className="text-xs text-gray-500">Exit: {new Date(pass.exitTime).toLocaleTimeString()}</p>}
                </div>
                <StatusBadge status={pass.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
