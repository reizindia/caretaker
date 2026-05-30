import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminFlat {
  id: string;
  name: string;
  slug: string;
}

interface AdminFlatStore {
  selectedFlat: AdminFlat | null;
  setSelectedFlat: (flat: AdminFlat | null) => void;
}

export const useAdminFlatStore = create<AdminFlatStore>()(
  persist(
    (set) => ({
      selectedFlat: null,
      setSelectedFlat: (flat) => set({ selectedFlat: flat }),
    }),
    { name: 'caretaker-admin-flat' },
  ),
);
