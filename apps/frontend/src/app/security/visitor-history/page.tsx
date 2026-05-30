'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function VisitorHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visitor-history', search, statusFilter],
    queryFn: () => apiClient.get(`/gate-passes?${statusFilter ? 'status=' + statusFilter + '&' : ''}search=${search}`).then((r) => r.data),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Visitor History</h1>
      <input className="input-field mb-3" placeholder="Search visitor name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'ENTERED', 'EXITED', 'APPROVED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{s || 'All'}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : !data?.passes?.length ? <EmptyState title="No visitor records found" /> : (
        <div className="table-scroll">
          <div className="divide-y">
            {data.passes.map((pass: any) => (
              <div key={pass.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{pass.visitorName}</p>
                    {pass.visitorPhone && <p className="text-xs text-gray-500">📞 {pass.visitorPhone}</p>}
                    <p className="text-xs text-gray-400">Resident: {pass.resident?.name} · Flat {pass.resident?.flatNumber}</p>
                    <p className="text-xs text-gray-400">Visit: {pass.expectedVisitDate}</p>
                    {pass.entryTime && <p className="text-xs text-green-600">Entry: {new Date(pass.entryTime).toLocaleString()}</p>}
                    {pass.exitTime && <p className="text-xs text-gray-500">Exit: {new Date(pass.exitTime).toLocaleString()}</p>}
                  </div>
                  <StatusBadge status={pass.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
