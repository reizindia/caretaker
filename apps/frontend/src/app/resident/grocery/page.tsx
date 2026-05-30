'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useCartStore } from '@/lib/store/cart.store';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';
import { ShoppingBag, ShoppingCart, Package, Plus, Check } from 'lucide-react';

export default function GroceryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { addGroceryItem, groceryItems } = useCartStore();

  const { data: items, isLoading } = useQuery({
    queryKey: ['grocery-items', search, category],
    queryFn: () => apiClient.get(`/grocery/items?search=${search}&category=${category}`).then((r) => r.data),
  });

  const cartCount = groceryItems.reduce((s, i) => s + i.quantity, 0);
  const categories = Array.from(new Set((items || []).map((i: any) => i.category).filter(Boolean))) as string[];

  const handleAdd = (item: any) => {
    addGroceryItem({ id: item.id, name: item.name, price: Number(item.price), quantity: 1, imageUrl: item.imageUrl });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Grocery</h1>
          <p className="text-xs font-medium text-slate-400">Fresh items delivered to your door</p>
        </div>
        <Link
          href="/resident/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <ShoppingBag size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search grocery items..."
          className="input-field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('')}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              !category
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !items?.length ? (
        <EmptyState
          icon={<Package size={26} />}
          title="No grocery items available"
          description="Check back later for fresh items"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item: any) => {
            const inCart = groceryItems.find((c) => c.id === item.id);
            const outOfStock = item.stockStatus !== 'IN_STOCK';
            return (
              <div
                key={item.id}
                className="card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)]"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center bg-slate-50 text-slate-300">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600 ring-1 ring-rose-200">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.description}</p>
                  )}
                  <div className="mt-2.5 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-950">₹{Number(item.price).toFixed(0)}</p>
                    {!outOfStock && (
                      <button
                        onClick={() => handleAdd(item)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-950 text-white hover:bg-slate-800'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check size={11} strokeWidth={2.5} />
                            {inCart.quantity}
                          </>
                        ) : (
                          <>
                            <Plus size={11} strokeWidth={2.5} />
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
