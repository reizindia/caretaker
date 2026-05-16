'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AssociationGatePassesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['assoc-gate-passes'], queryFn: () => apiClient.get('/gate-passes').then((r) => r.data) });

  return (
    <div>
      <PageHeader title="Gate Passes" />
      {isLoading ? <LoadingSpinner /> : !data?.passes?.length ? <EmptyState title="No gate passes" /> : (
        <div className="space-y-3">
          {data.passes.map((pass: any) => (
            <div key={pass.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{pass.visitorName}</p>
                  {pass.visitorPhone && <p className="text-sm text-gray-500">📞 {pass.visitorPhone}</p>}
                  {pass.purpose && <p className="text-sm text-gray-500">Purpose: {pass.purpose}</p>}
                  <p className="text-xs text-gray-400">Resident: {pass.resident?.name} · Flat {pass.resident?.flatNumber}</p>
                  <p className="text-xs text-gray-400">📅 {pass.expectedVisitDate}</p>
                  {pass.entryTime && <p className="text-xs text-green-600">Entry: {new Date(pass.entryTime).toLocaleString()}</p>}
                  {pass.exitTime && <p className="text-xs text-gray-500">Exit: {new Date(pass.exitTime).toLocaleString()}</p>}
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
