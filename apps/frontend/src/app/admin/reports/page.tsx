'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminReportsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-reports-dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader title="Reports" description="Platform-wide statistics" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Residents', value: dashboard?.totalResidents || 0, icon: '👥' },
          { label: 'Grocery Orders', value: dashboard?.groceryOrders || 0, icon: '🛒' },
          { label: 'Food Orders', value: dashboard?.foodOrders || 0, icon: '🍜' },
          { label: 'Service Bookings', value: dashboard?.serviceBookings || 0, icon: '🔧' },
          { label: 'Gate Passes', value: dashboard?.gatePasses || 0, icon: '🎫' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
