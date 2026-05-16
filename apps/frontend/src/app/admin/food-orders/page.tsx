'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function FoodOrdersPage() {
  const [flatSlug, setFlatSlug] = useState('');
  const queryClient = useQueryClient();
  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['food-orders-admin', flatSlug],
    queryFn: () => apiClient.get('/food/orders', { headers: { 'X-Tenant-Slug': flatSlug } }).then((r) => r.data),
    enabled: !!flatSlug,
  });

  const updateStatus = async (id: string, status: string) => {
    try { await apiClient.patch(`/food/orders/${id}/status`, { status }, { headers: { 'X-Tenant-Slug': flatSlug } }); queryClient.invalidateQueries({ queryKey: ['food-orders-admin'] }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader title="Food Orders" />
      <div className="mb-4"><select className="input-field w-auto" value={flatSlug} onChange={(e) => setFlatSlug(e.target.value)}><option value="">Select a flat</option>{flatsData?.flats?.map((f: any) => <option key={f.id} value={f.slug}>{f.name}</option>)}</select></div>
      {!flatSlug ? <EmptyState title="Select a flat" /> : isLoading ? <LoadingSpinner /> : !data?.orders?.length ? <EmptyState title="No food orders" /> : (
        <div className="space-y-3">
          {data.orders.map((order: any) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{order.resident?.name} · Flat {order.resident?.flatNumber}</p>
                  <p className="text-xs text-blue-600">{order.hotel?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  <div className="mt-2 space-y-1">
                    {order.items?.map((item: any) => <p key={item.id} className="text-sm text-gray-600">{item.itemNameSnapshot} × {item.quantity} = ₹{Number(item.subtotal).toFixed(2)}</p>)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                  <div className="mt-2">
                    <select className="input-field text-xs" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                      <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
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
