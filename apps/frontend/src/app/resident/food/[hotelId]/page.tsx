'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { processPayment } from '@/lib/payment';
import { useCartStore } from '@/lib/store/cart.store';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function HotelMenuPage() {
  const { hotelId } = useParams() as { hotelId: string };
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { foodItems, addFoodItem, updateFoodQty, removeFoodItem, foodTotal, clearFoodCart } = useCartStore();
  const router = useRouter();

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: () => apiClient.get(`/hotels/${hotelId}`).then((r) => r.data),
  });

  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['hotel-foods', hotelId],
    queryFn: () => apiClient.get(`/hotels/${hotelId}/foods`).then((r) => r.data),
  });

  const hotelCartItems = foodItems.filter((i) => i.hotelId === hotelId);
  const cartTotal = hotelCartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = hotelCartItems.reduce((s, i) => s + i.quantity, 0);

  const handleAdd = (food: any) => {
    addFoodItem({ id: food.id, name: food.name, price: Number(food.price), quantity: 1, imageUrl: food.imageUrl, hotelId, hotelName: hotel?.name });
    toast.success(`${food.name} added`);
  };

  const placeOrder = async () => {
    if (!hotelCartItems.length) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/food/orders', {
        hotelId,
        items: hotelCartItems.map((i) => ({ foodItemId: i.id, quantity: i.quantity })),
        notes,
      });
      const order = response.data;
      clearFoodCart();

      await processPayment({
        orderType: 'food',
        dbOrderId: order.id,
        onSuccess: () => {
          router.push('/resident/orders');
        },
        onFailure: () => {
          router.push('/resident/orders');
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (hotelLoading || foodsLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="p-4">
      <div className="mb-4">
        {hotel?.imageUrl && <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover rounded-xl mb-3" />}
        <h1 className="text-xl font-bold">{hotel?.name}</h1>
        <p className="text-sm text-gray-500">{hotel?.description}</p>
      </div>

      {!foods?.length ? <EmptyState title="No menu items available" /> : (
        <div className="space-y-3 mb-6">
          {foods.map((food: any) => {
            const inCart = hotelCartItems.find((c) => c.id === food.id);
            return (
              <div key={food.id} className="card flex items-center gap-3">
                {food.imageUrl && <img src={food.imageUrl} alt={food.name} className="w-16 h-16 object-cover rounded-lg" />}
                <div className="flex-1">
                  <p className="font-medium">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.description}</p>
                  <p className="text-blue-600 font-bold text-sm">₹{Number(food.price).toFixed(2)}</p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateFoodQty(food.id, inCart.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center">-</button>
                    <span className="font-medium">{inCart.quantity}</span>
                    <button onClick={() => updateFoodQty(food.id, inCart.quantity + 1)} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">+</button>
                  </div>
                ) : (
                  <button onClick={() => handleAdd(food)} className="btn-primary text-sm py-1 px-3">Add</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hotelCartItems.length > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-30">
          <div className="bg-white rounded-xl shadow-lg border p-4">
            <textarea className="input-field mb-3 text-sm" rows={2} placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Placing...' : `Place Order (${cartCount} items) — ₹${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
