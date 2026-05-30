'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function ServiceBookingsPage() {
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bookings-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/service-bookings').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  const updateStatus = async (id: string, status: string) => {
    try { await apiClient.patch(`/service-bookings/${id}/status`, { status }); queryClient.invalidateQueries({ queryKey: ['bookings-admin'] }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Service Bookings" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} />
      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : isLoading ? <LoadingSpinner /> : !data?.bookings?.length ? <EmptyState title="No bookings" /> : (
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Resident</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Service</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{b.resident?.name}<br /><span className="text-xs text-gray-400">Flat {b.resident?.flatNumber}</span></td>
                  <td className="px-4 py-3 font-medium">{b.service?.name}</td>
                  <td className="px-4 py-3">{b.timeSlot?.date}<br /><span className="text-xs text-gray-400">{b.timeSlot?.startTime} – {b.timeSlot?.endTime}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <select className="input-field text-xs" value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
                      <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
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
