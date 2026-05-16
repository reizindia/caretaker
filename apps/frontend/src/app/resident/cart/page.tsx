'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart.store';
import apiClient from '@/lib/api/client';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { groceryItems, updateGroceryQty, removeGroceryItem, groceryTotal, clearGroceryCart } = useCartStore();
  const router = useRouter();

  const placeOrder = async () => {
    if (!groceryItems.length) return;
    setLoading(true);
    try {
      await apiClient.post('/grocery/orders', {
        items: groceryItems.map((i) => ({ groceryItemId: i.id, quantity: i.quantity })),
        notes,
      });
      clearGroceryCart();
      toast.success('Order placed successfully!');
      router.push('/resident/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!groceryItems.length) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Grocery Cart</h1>
        <EmptyState title="Your cart is empty" description="Add items from the grocery section" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Grocery Cart</h1>
      <div className="space-y-3 mb-4">
        {groceryItems.map((item) => (
          <div key={item.id} className="card flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-blue-600 text-sm">₹{item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateGroceryQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 font-bold">-</button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateGroceryQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">+</button>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeGroceryItem(item.id)} className="text-red-500 text-xs">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <textarea className="input-field mb-4" rows={3} placeholder="Add delivery notes (optional)..." value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="card mb-4">
        <div className="flex justify-between text-sm mb-2"><span>Items ({groceryItems.length})</span><span>₹{groceryTotal().toFixed(2)}</span></div>
        <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="text-blue-600">₹{groceryTotal().toFixed(2)}</span></div>
      </div>

      <button onClick={placeOrder} disabled={loading} className="btn-primary w-full py-4 text-base">
        {loading ? 'Placing order...' : `Place Order — ₹${groceryTotal().toFixed(2)}`}
      </button>
    </div>
  );
}
