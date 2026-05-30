'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart.store';
import apiClient from '@/lib/api/client';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/resident/grocery" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-950">Your Cart</h1>
          <p className="text-xs font-medium text-slate-400">
            {groceryItems.length} {groceryItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {!groceryItems.length ? (
        <EmptyState
          icon={<ShoppingCart size={26} />}
          title="Your cart is empty"
          description="Add items from the grocery section to continue"
          action={
            <Link href="/resident/grocery" className="btn-primary">
              Browse Grocery
            </Link>
          }
        />
      ) : (
        <>
          {/* Cart Items */}
          <div className="mb-4 space-y-2.5">
            {groceryItems.map((item) => (
              <div key={item.id} className="card flex items-center gap-3 p-3.5">
                {/* Icon / Image */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingCart size={18} />
                </div>

                {/* Name + Price */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs font-medium text-slate-400">₹{item.price.toFixed(0)} each</p>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGroceryQty(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-950">{item.quantity}</span>
                  <button
                    onClick={() => updateGroceryQty(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white transition hover:bg-slate-800"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-950">₹{(item.price * item.quantity).toFixed(0)}</p>
                  <button
                    onClick={() => removeGroceryItem(item.id)}
                    className="mt-0.5 flex items-center gap-0.5 text-[11px] font-semibold text-rose-500 transition hover:text-rose-700"
                  >
                    <Trash2 size={10} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Notes */}
          <textarea
            className="input-field mb-4 resize-none"
            rows={3}
            placeholder="Add delivery notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Order Summary */}
          <div className="card mb-4 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Order Summary</p>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Items ({groceryItems.length})</span>
              <span className="font-semibold text-slate-800">₹{groceryTotal().toFixed(0)}</span>
            </div>
            <div className="divider mb-2" />
            <div className="flex justify-between text-sm font-bold text-slate-950">
              <span>Total</span>
              <span>₹{groceryTotal().toFixed(0)}</span>
            </div>
          </div>

          {/* Place Order */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? 'Placing order...' : `Place Order · ₹${groceryTotal().toFixed(0)}`}
          </button>
        </>
      )}
    </div>
  );
}
