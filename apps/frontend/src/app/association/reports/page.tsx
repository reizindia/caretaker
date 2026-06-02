'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AssociationReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['assoc-reports'], queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data) });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader title="Reports" description="Your apartment statistics" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Residents', value: data?.totalResidents || 0, icon: '👥', color: 'text-blue-600' },
          { label: 'Grocery Orders', value: data?.groceryOrders || 0, icon: '🛒', color: 'text-green-600' },
          { label: 'Food Orders', value: data?.foodOrders || 0, icon: '🍜', color: 'text-orange-600' },
          { label: 'Service Bookings', value: data?.serviceBookings || 0, icon: '🔧', color: 'text-purple-600' },
          { label: 'Gate Passes', value: data?.gatePasses || 0, icon: '🎫', color: 'text-pink-600' },
        ].map((s) => (
          <div key={s.label} className="card card-padded text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card card-padded">
          <h2 className="font-semibold mb-3">Recent Grocery Orders</h2>
          {!data?.recentGroceryOrders?.length ? <p className="text-sm text-gray-400">No orders yet</p> : data.recentGroceryOrders.map((o: any) => (
            <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-sm">{o.resident?.name}</span>
              <span className="text-sm font-medium text-blue-600">₹{Number(o.totalAmount).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="card card-padded">
          <h2 className="font-semibold mb-3">Recent Food Orders</h2>
          {!data?.recentFoodOrders?.length ? <p className="text-sm text-gray-400">No orders yet</p> : data.recentFoodOrders.map((o: any) => (
            <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div><span className="text-sm">{o.resident?.name}</span><br /><span className="text-xs text-gray-400">{o.hotel?.name}</span></div>
              <span className="text-sm font-medium text-blue-600">₹{Number(o.totalAmount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
