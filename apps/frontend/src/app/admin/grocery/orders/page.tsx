'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function GroceryOrdersPage() {
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['grocery-orders-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/grocery/orders').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiClient.patch(`/grocery/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['grocery-orders-admin'] });
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Grocery Orders" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} />
      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : isLoading ? <LoadingSpinner /> : !data?.orders?.length ? <EmptyState title="No orders" /> : (
        <div className="space-y-3">
          {data.orders.map((order: any) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{order.resident?.name} · Flat {order.resident?.flatNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  <div className="mt-2 space-y-1">
                    {order.items?.map((item: any) => (
                      <p key={item.id} className="text-sm text-gray-600">{item.itemNameSnapshot} × {item.quantity} = ₹{Number(item.subtotal).toFixed(2)}</p>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                  <div className="mt-2">
                    <select className="input-field text-xs" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
