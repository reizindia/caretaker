'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

type Tab = 'grocery' | 'food' | 'bookings' | 'gate-pass';

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('grocery');

  const { data: groceryOrders, isLoading: g } = useQuery({ queryKey: ['my-grocery-orders-all'], queryFn: () => apiClient.get('/grocery/orders').then((r) => r.data) });
  const { data: foodOrders, isLoading: f } = useQuery({ queryKey: ['my-food-orders-all'], queryFn: () => apiClient.get('/food/orders').then((r) => r.data) });
  const { data: bookings, isLoading: b } = useQuery({ queryKey: ['my-bookings-all'], queryFn: () => apiClient.get('/service-bookings').then((r) => r.data) });
  const { data: gatePasses, isLoading: gp } = useQuery({ queryKey: ['my-gate-passes-all'], queryFn: () => apiClient.get('/gate-passes').then((r) => r.data) });

  const tabs = [
    { key: 'grocery', label: 'Grocery' },
    { key: 'food', label: 'Food' },
    { key: 'bookings', label: 'Services' },
    { key: 'gate-pass', label: 'Gate Pass' },
  ] as const;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      <div className="flex border-b mb-4 gap-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'grocery' && (
        g ? <LoadingSpinner /> : !groceryOrders?.orders?.length ? <EmptyState title="No grocery orders" /> : (
          <div className="space-y-3">
            {groceryOrders.orders.map((order: any) => (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    {order.items?.map((i: any) => <p key={i.id} className="text-sm text-gray-600">{i.itemNameSnapshot} × {i.quantity}</p>)}
                  </div>
                  <div className="text-right"><p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p><StatusBadge status={order.status} /></div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'food' && (
        f ? <LoadingSpinner /> : !foodOrders?.orders?.length ? <EmptyState title="No food orders" /> : (
          <div className="space-y-3">
            {foodOrders.orders.map((order: any) => (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{order.hotel?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    {order.items?.map((i: any) => <p key={i.id} className="text-sm text-gray-600">{i.itemNameSnapshot} × {i.quantity}</p>)}
                  </div>
                  <div className="text-right"><p className="font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</p><StatusBadge status={order.status} /></div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'bookings' && (
        b ? <LoadingSpinner /> : !bookings?.bookings?.length ? <EmptyState title="No service bookings" /> : (
          <div className="space-y-3">
            {bookings.bookings.map((bk: any) => (
              <div key={bk.id} className="card flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{bk.service?.name}</p>
                  <p className="text-xs text-gray-500">{bk.timeSlot?.date} · {bk.timeSlot?.startTime} – {bk.timeSlot?.endTime}</p>
                </div>
                <StatusBadge status={bk.status} />
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'gate-pass' && (
        gp ? <LoadingSpinner /> : !gatePasses?.passes?.length ? <EmptyState title="No gate passes" /> : (
          <div className="space-y-3">
            {gatePasses.passes.map((pass: any) => (
              <div key={pass.id} className="card flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{pass.visitorName}</p>
                  <p className="text-xs text-gray-500">{pass.expectedVisitDate}</p>
                </div>
                <StatusBadge status={pass.status} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
