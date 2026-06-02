'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function AssociationOrdersPage() {
  const [tab, setTab] = useState<'grocery' | 'food'>('grocery');

  const { data: groceryOrders, isLoading: g } = useQuery({ queryKey: ['assoc-grocery-orders'], queryFn: () => apiClient.get('/grocery/orders').then((r) => r.data) });
  const { data: foodOrders, isLoading: f } = useQuery({ queryKey: ['assoc-food-orders'], queryFn: () => apiClient.get('/food/orders').then((r) => r.data) });

  return (
    <div>
      <PageHeader title="Orders" />
      <div className="flex border-b mb-4 gap-1">
        <button onClick={() => setTab('grocery')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'grocery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Grocery Orders</button>
        <button onClick={() => setTab('food')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'food' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Food Orders</button>
      </div>

      {tab === 'grocery' && (g ? <LoadingSpinner /> : !groceryOrders?.orders?.length ? <EmptyState title="No grocery orders" /> : (
        <div className="space-y-3">
          {groceryOrders.orders.map((order: any) => (
            <div key={order.id} className="card card-padded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.resident?.name} · Flat {order.resident?.flatNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  {order.items?.map((i: any) => <p key={i.id} className="text-sm text-gray-600">{i.itemNameSnapshot} × {i.quantity}</p>)}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p>
                  <div className="mt-2 text-right"><StatusBadge status={order.status} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {tab === 'food' && (f ? <LoadingSpinner /> : !foodOrders?.orders?.length ? <EmptyState title="No food orders" /> : (
        <div className="space-y-3">
          {foodOrders.orders.map((order: any) => (
            <div key={order.id} className="card card-padded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.resident?.name} · Flat {order.resident?.flatNumber}</p>
                  <p className="text-xs text-blue-600">{order.hotel?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  {order.items?.map((i: any) => <p key={i.id} className="text-sm text-gray-600">{i.itemNameSnapshot} × {i.quantity}</p>)}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p>
                  <div className="mt-2 text-right"><StatusBadge status={order.status} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
