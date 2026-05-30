'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AssociationResidentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['assoc-residents'], queryFn: () => apiClient.get('/users?role=RESIDENT').then((r) => r.data) });

  return (
    <div>
      <PageHeader title="Residents" />
      {isLoading ? <LoadingSpinner /> : !data?.users?.length ? <EmptyState title="No residents registered" /> : (
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Flat Number</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{user.flatNumber || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
