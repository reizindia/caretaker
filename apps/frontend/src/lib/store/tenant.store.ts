import { create } from 'zustand';

interface Tenant {
  flatId: string;
  flatName: string;
  slug: string;
  logoUrl?: string;
  themeColor?: string;
  status: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
}

interface TenantStore {
  tenant: Tenant | null;
  slug: string | null;
  setTenant: (tenant: Tenant) => void;
  setSlug: (slug: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
  tenant: null,
  slug: null,
  setTenant: (tenant) => set({ tenant, slug: tenant.slug }),
  setSlug: (slug) => set({ slug }),
  clearTenant: () => set({ tenant: null, slug: null }),
}));
