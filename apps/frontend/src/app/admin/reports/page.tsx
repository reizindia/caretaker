'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function AdminReportsPage() {
  const { selectedFlat } = useAdminFlatStore();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-reports-dashboard', selectedFlat?.slug],
    queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader
        title="Reports"
        description={selectedFlat ? `Statistics for ${selectedFlat.name}` : 'Select an active flat from the sidebar'}
      />
      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Residents', value: dashboard?.totalResidents || 0 },
            { label: 'Grocery Orders', value: dashboard?.groceryOrders || 0 },
            { label: 'Food Orders', value: dashboard?.foodOrders || 0 },
            { label: 'Service Bookings', value: dashboard?.serviceBookings || 0 },
            { label: 'Gate Passes', value: dashboard?.gatePasses || 0 },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
