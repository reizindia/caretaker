'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function GroceryRequestsPage() {
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['grocery-requests-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/grocery/requests').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  const updateStatus = async (id: string, status: string) => {
    try { await apiClient.patch(`/grocery/requests/${id}/status`, { status }); queryClient.invalidateQueries({ queryKey: ['grocery-requests-admin'] }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Unavailable Item Requests" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} />
      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : isLoading ? <LoadingSpinner /> : !data?.requests?.length ? <EmptyState title="No requests" /> : (
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Resident</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Qty</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{req.resident?.name}<br /><span className="text-xs text-gray-400">Flat {req.resident?.flatNumber}</span></td>
                  <td className="px-4 py-3 font-medium">{req.itemName}</td>
                  <td className="px-4 py-3 text-gray-500">{req.quantity || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{req.notes || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3">
                    <select className="input-field text-xs" value={req.status} onChange={(e) => updateStatus(req.id, e.target.value)}>
                      <option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
