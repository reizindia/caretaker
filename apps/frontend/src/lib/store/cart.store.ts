import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type: 'grocery' | 'food';
  hotelId?: string;
  hotelName?: string;
}

interface CartStore {
  groceryItems: CartItem[];
  foodItems: CartItem[];
  addGroceryItem: (item: Omit<CartItem, 'type'>) => void;
  addFoodItem: (item: Omit<CartItem, 'type'>) => void;
  updateGroceryQty: (id: string, qty: number) => void;
  updateFoodQty: (id: string, qty: number) => void;
  removeGroceryItem: (id: string) => void;
  removeFoodItem: (id: string) => void;
  clearGroceryCart: () => void;
  clearFoodCart: () => void;
  groceryTotal: () => number;
  foodTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      groceryItems: [],
      foodItems: [],

      addGroceryItem: (item) => {
        const items = get().groceryItems;
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({ groceryItems: items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ groceryItems: [...items, { ...item, type: 'grocery' }] });
        }
      },

      addFoodItem: (item) => {
        const items = get().foodItems;
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({ foodItems: items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ foodItems: [...items, { ...item, type: 'food' }] });
        }
      },

      updateGroceryQty: (id, qty) => {
        if (qty <= 0) return get().removeGroceryItem(id);
        set({ groceryItems: get().groceryItems.map((i) => i.id === id ? { ...i, quantity: qty } : i) });
      },

      updateFoodQty: (id, qty) => {
        if (qty <= 0) return get().removeFoodItem(id);
        set({ foodItems: get().foodItems.map((i) => i.id === id ? { ...i, quantity: qty } : i) });
      },

      removeGroceryItem: (id) => set({ groceryItems: get().groceryItems.filter((i) => i.id !== id) }),
      removeFoodItem: (id) => set({ foodItems: get().foodItems.filter((i) => i.id !== id) }),
      clearGroceryCart: () => set({ groceryItems: [] }),
      clearFoodCart: () => set({ foodItems: [] }),

      groceryTotal: () => get().groceryItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      foodTotal: () => get().foodItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'caretaker-cart' },
  ),
);
