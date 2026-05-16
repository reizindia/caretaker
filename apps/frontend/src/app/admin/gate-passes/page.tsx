'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AdminGatePassesPage() {
  const [flatSlug, setFlatSlug] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['gate-passes-admin', flatSlug, statusFilter],
    queryFn: () => apiClient.get(`/gate-passes${statusFilter ? '?status=' + statusFilter : ''}`, { headers: { 'X-Tenant-Slug': flatSlug } }).then((r) => r.data),
    enabled: !!flatSlug,
  });

  return (
    <div>
      <PageHeader title="Gate Passes" />
      <div className="flex gap-3 mb-4">
        <select className="input-field w-auto" value={flatSlug} onChange={(e) => setFlatSlug(e.target.value)}><option value="">Select a flat</option>{flatsData?.flats?.map((f: any) => <option key={f.id} value={f.slug}>{f.name}</option>)}</select>
        {flatSlug && <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="ENTERED">Entered</option><option value="EXITED">Exited</option></select>}
      </div>
      {!flatSlug ? <EmptyState title="Select a flat" /> : isLoading ? <LoadingSpinner /> : !data?.passes?.length ? <EmptyState title="No gate passes" /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Visitor</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Resident</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Purpose</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Expected Visit</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.passes.map((pass: any) => (
                <tr key={pass.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium">{pass.visitorName}</p><p className="text-xs text-gray-400">{pass.visitorPhone}</p></td>
                  <td className="px-4 py-3">{pass.resident?.name}<br /><span className="text-xs text-gray-400">Flat {pass.resident?.flatNumber}</span></td>
                  <td className="px-4 py-3 text-gray-500">{pass.purpose || '-'}</td>
                  <td className="px-4 py-3">{pass.expectedVisitDate}<br /><span className="text-xs text-gray-400">{pass.expectedVisitTime}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={pass.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
