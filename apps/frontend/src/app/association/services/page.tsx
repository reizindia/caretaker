'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function AssociationServicesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['assoc-bookings'], queryFn: () => apiClient.get('/service-bookings').then((r) => r.data) });

  const updateStatus = async (id: string, status: string) => {
    try { await apiClient.patch(`/service-bookings/${id}/status`, { status }); queryClient.invalidateQueries({ queryKey: ['assoc-bookings'] }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Service Bookings" />
      {isLoading ? <LoadingSpinner /> : !data?.bookings?.length ? <EmptyState title="No service bookings" /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Resident</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Service</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Update</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{b.resident?.name}<br /><span className="text-xs text-gray-400">Flat {b.resident?.flatNumber}</span></td>
                  <td className="px-4 py-3 font-medium">{b.service?.name}</td>
                  <td className="px-4 py-3">{b.timeSlot?.date}<br /><span className="text-xs text-gray-400">{b.timeSlot?.startTime}–{b.timeSlot?.endTime}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3"><select className="input-field text-xs" value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
