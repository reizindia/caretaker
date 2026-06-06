'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { processPayment } from '@/lib/payment';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { CalendarDays, KeyRound, Package, ShoppingCart, Soup, Wrench } from 'lucide-react';

type Tab = 'grocery' | 'food' | 'bookings' | 'gate-pass';

const tabs = [
  { key: 'grocery' as Tab, label: 'Grocery', icon: ShoppingCart },
  { key: 'food' as Tab, label: 'Food', icon: Soup },
  { key: 'bookings' as Tab, label: 'Services', icon: Wrench },
  { key: 'gate-pass' as Tab, label: 'Gate Pass', icon: KeyRound },
] as const;

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('grocery');
  const queryClient = useQueryClient();

  const { data: groceryOrders, isLoading: g } = useQuery({
    queryKey: ['my-grocery-orders-all'],
    queryFn: () => apiClient.get('/grocery/orders').then((r) => r.data),
  });
  const { data: foodOrders, isLoading: f } = useQuery({
    queryKey: ['my-food-orders-all'],
    queryFn: () => apiClient.get('/food/orders').then((r) => r.data),
  });
  const { data: bookings, isLoading: b } = useQuery({
    queryKey: ['my-bookings-all'],
    queryFn: () => apiClient.get('/service-bookings').then((r) => r.data),
  });
  const { data: gatePasses, isLoading: gp } = useQuery({
    queryKey: ['my-gate-passes-all'],
    queryFn: () => apiClient.get('/gate-passes').then((r) => r.data),
  });

  const handlePayNow = async (orderType: 'grocery' | 'food' | 'service', dbOrderId: string) => {
    await processPayment({
      orderType,
      dbOrderId,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['my-grocery-orders-all'] });
        queryClient.invalidateQueries({ queryKey: ['my-food-orders-all'] });
        queryClient.invalidateQueries({ queryKey: ['my-bookings-all'] });
      },
    });
  };


  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-950">My Orders</h1>
        <p className="text-xs font-medium text-slate-400">Track all your activity in one place</p>
      </div>

      {/* Tab Bar */}
      <div className="mb-4 flex rounded-2xl border border-slate-100 bg-slate-50 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-white text-slate-950 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon size={13} strokeWidth={2.2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Grocery Orders */}
      {tab === 'grocery' && (
        g ? <LoadingSpinner /> : !groceryOrders?.orders?.length ? (
          <EmptyState icon={<ShoppingCart size={26} />} title="No grocery orders yet" description="Place your first grocery order" />
        ) : (
          <div className="space-y-2.5">
            {groceryOrders.orders.map((order: any) => (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShoppingCart size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                      <div className="mt-0.5 space-y-0.5">
                        {order.items?.slice(0, 3).map((i: any) => (
                          <p key={i.id} className="text-sm font-medium text-slate-700">
                            {i.itemNameSnapshot} <span className="text-slate-400">× {i.quantity}</span>
                          </p>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-slate-400">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-bold text-slate-950">₹{Number(order.totalAmount).toFixed(0)}</p>
                    <StatusBadge status={order.status} />
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handlePayNow('grocery', order.id)}
                        className="mt-1 rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition active:scale-95"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Food Orders */}
      {tab === 'food' && (
        f ? <LoadingSpinner /> : !foodOrders?.orders?.length ? (
          <EmptyState icon={<Soup size={26} />} title="No food orders yet" description="Order from your favourite restaurant" />
        ) : (
          <div className="space-y-2.5">
            {foodOrders.orders.map((order: any) => (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Soup size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{order.hotel?.name}</p>
                      <p className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                      <div className="mt-0.5 space-y-0.5">
                        {order.items?.slice(0, 3).map((i: any) => (
                          <p key={i.id} className="text-sm font-medium text-slate-700">
                            {i.itemNameSnapshot} <span className="text-slate-400">× {i.quantity}</span>
                          </p>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-slate-400">+{order.items.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-bold text-slate-950">₹{Number(order.totalAmount).toFixed(0)}</p>
                    <StatusBadge status={order.status} />
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handlePayNow('food', order.id)}
                        className="mt-1 rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition active:scale-95"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Service Bookings */}
      {tab === 'bookings' && (
        b ? <LoadingSpinner /> : !bookings?.bookings?.length ? (
          <EmptyState icon={<Wrench size={26} />} title="No service bookings yet" description="Book a service to get started" />
        ) : (
          <div className="space-y-2.5">
            {bookings.bookings.map((bk: any) => (
              <div key={bk.id} className="card flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Wrench size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{bk.service?.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={11} />
                      {bk.timeSlot?.date} · {bk.timeSlot?.startTime} – {bk.timeSlot?.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={bk.status} />
                  {bk.status === 'PENDING' && bk.service?.basePrice && Number(bk.service?.basePrice) > 0 && (
                    <button
                      onClick={() => handlePayNow('service', bk.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition active:scale-95"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Gate Passes */}
      {tab === 'gate-pass' && (
        gp ? <LoadingSpinner /> : !gatePasses?.passes?.length ? (
          <EmptyState icon={<KeyRound size={26} />} title="No gate passes yet" description="Request a visitor pass to allow guests entry" />
        ) : (
          <div className="space-y-2.5">
            {gatePasses.passes.map((pass: any) => (
              <div key={pass.id} className="card flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <KeyRound size={16} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{pass.visitorName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays size={11} />
                    {pass.expectedVisitDate}
                  </p>
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
