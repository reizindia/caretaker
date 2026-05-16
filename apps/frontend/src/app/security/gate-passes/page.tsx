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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gate Passes</h1>
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
