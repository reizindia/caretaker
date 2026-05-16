'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useCartStore } from '@/lib/store/cart.store';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Grocery</h1>
        <Link href="/resident/cart" className="relative">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg">🛒</div>
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
        </Link>
      </div>

      <input type="text" placeholder="Search grocery items..." className="input-field mb-3" value={search} onChange={(e) => setSearch(e.target.value)} />

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button onClick={() => setCategory('')} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{cat}</button>
          ))}
        </div>
      )}

      {isLoading ? <LoadingSpinner /> : !items?.length ? (
        <EmptyState title="No grocery items available" description="Check back later for fresh items" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item: any) => {
            const inCart = groceryItems.find((c) => c.id === item.id);
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-3xl">🛒</div>
                )}
                <div className="p-3">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-bold text-blue-600">₹{Number(item.price).toFixed(2)}</p>
                    {item.stockStatus === 'IN_STOCK' ? (
                      <button onClick={() => handleAdd(item)} className={`px-3 py-1 rounded-lg text-xs font-medium ${inCart ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}>
                        {inCart ? `In Cart (${inCart.quantity})` : 'Add'}
                      </button>
                    ) : (
                      <span className="text-xs text-red-500">Out of Stock</span>
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
