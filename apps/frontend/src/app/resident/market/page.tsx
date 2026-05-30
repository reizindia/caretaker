'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Globe2,
  ImageIcon,
  PackagePlus,
  Phone,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PageHeader from '@/components/shared/PageHeader';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { useAuthStore } from '@/lib/store/auth.store';

type Listing = {
  id: string;
  title: string;
  description?: string;
  price: string | number;
  imageUrl?: string;
  category?: string;
  condition?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'INACTIVE';
  createdAt: string;
  seller: {
    id: string;
    name: string;
    flatNumber?: string;
    flat?: { name?: string };
  };
};

const emptyForm = { title: '', price: '', condition: '', imageUrl: '', description: '', category: '' };

export default function MarketPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'browse' | 'products'>('browse');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: settings } = useQuery<{ fleeMarketAdminPhone: string }>({
    queryKey: ['platform-settings'],
    queryFn: () => apiClient.get('/settings').then((r) => r.data),
  });

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['flee-market-listings', search],
    queryFn: () => apiClient.get('/market/listings', { params: { search } }).then((r) => r.data),
  });

  const { data: myListings = [] } = useQuery<Listing[]>({
    queryKey: ['my-flee-market-listings'],
    queryFn: () => apiClient.get('/market/listings/mine').then((r) => r.data),
  });

  const createListing = useMutation({
    mutationFn: () => apiClient.post('/market/listings', { ...form, price: Number(form.price || 0) }).then((r) => r.data),
    onSuccess: () => {
      setForm(emptyForm);
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['flee-market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-flee-market-listings'] });
      toast.success('Published to Flee Market');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to publish listing');
    },
  });

  const deleteListing = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/market/listings/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flee-market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-flee-market-listings'] });
      toast.success('Listing deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete listing');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Listing['status'] }) =>
      apiClient.patch(`/market/listings/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flee-market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-flee-market-listings'] });
      toast.success('Listing status updated');
    },
  });

  const adminPhone = settings?.fleeMarketAdminPhone?.trim() || '';
  const visibleListings = useMemo(() => listings.filter((item) => item.status === 'AVAILABLE'), [listings]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    createListing.mutate();
  };

  const handleAdminCall = (event: React.MouseEvent) => {
    if (!adminPhone) {
      event.preventDefault();
      toast.error('Flee Market admin number is not configured yet.');
    }
  };

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      <PageHeader
        title="Flee Market"
        description="Publish once and show your listing to every resident across the platform."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/60">
            <Globe2 size={14} /> Global Market
          </span>
        }
      />

      <div className="mb-5 flex rounded-2xl border border-slate-100 bg-slate-50 p-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'browse'
              ? 'bg-white text-slate-950 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag size={13} strokeWidth={2.2} />
          Browse
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'products'
              ? 'bg-white text-slate-950 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Tag size={13} strokeWidth={2.2} />
          My Listings
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="space-y-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input-field pl-10" placeholder="Search all Flee Market items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>

          {isLoading ? (
            <LoadingSpinner />
          ) : visibleListings.length === 0 ? (
            <EmptyState title="No items listed yet" description="Publish a listing from My Listings to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleListings.map((item) => {
                const isMine = item.seller.id === user?.id;
                return (
                  <article key={item.id} className="card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)]">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-slate-50 text-slate-300">
                        <ImageIcon size={36} />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-slate-950">{item.title}</h2>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            {item.seller.name} {isMine && '(You)'} · {item.seller.flat?.name || 'Apartment'} · Flat {item.seller.flatNumber || '--'}
                          </p>
                        </div>
                        <p className="shrink-0 text-base font-bold text-emerald-700">Rs. {Number(item.price).toFixed(0)}</p>
                      </div>
                      {item.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.description}</p>}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {item.condition && (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200/60">
                            {item.condition}
                          </span>
                        )}
                        {item.category && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <a
                        href={adminPhone ? `tel:${adminPhone}` : '#'}
                        onClick={handleAdminCall}
                        className="btn-primary mt-3.5 flex h-9 w-full items-center justify-center text-sm"
                      >
                        <Phone size={15} />
                        Call Admin
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 hover:bg-slate-50 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <PackagePlus size={16} className="text-violet-600" />
              Publish a Listing
            </span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
              showAddForm ? 'bg-slate-200 text-slate-700' : 'bg-slate-950 text-white'
            }`}>
              {showAddForm ? 'x' : '+'}
            </span>
          </button>

          {showAddForm && (
            <div className="card p-5 animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <PackagePlus size={15} strokeWidth={2.2} />
                  </div>
                  <p className="text-sm font-bold text-slate-950">Listing Details</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Title</label>
                    <input className="input-field" placeholder="e.g. Electric kettle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Price (Rs.)</label>
                    <input className="input-field" type="number" min="0" step="1" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Condition</label>
                    <input className="input-field" placeholder="Brand new, gently used..." value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input className="input-field" placeholder="Furniture, appliance..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                </div>
                <ImageUploadField label="Listing Image" value={form.imageUrl} folder="flee-market" onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
                <div>
                  <label className="label">Description</label>
                  <textarea className="input-field min-h-[80px] resize-none" placeholder="Specifications, usage history, reason for selling..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <button className="btn-primary w-full py-3" disabled={createListing.isPending}>
                  {createListing.isPending ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
            </div>
          )}

          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <ShoppingBag size={15} strokeWidth={2.2} />
              </div>
              <h2 className="text-sm font-bold text-slate-950">My Listings</h2>
            </div>
            {myListings.length === 0 ? (
              <div className="empty-state py-8">
                <p className="text-sm font-medium text-slate-400">No listings yet.</p>
                <p className="text-xs text-slate-300">Publish your first item above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myListings.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-colors hover:bg-slate-100/60">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">Rs. {Number(item.price).toFixed(0)}</p>
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 ring-slate-200/60'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {item.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => {
                            if (window.confirm('Mark this listing as sold?')) {
                              updateStatus.mutate({ id: item.id, status: 'SOLD' });
                            }
                          }}
                          className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-emerald-600"
                        >
                          Mark Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus.mutate({ id: item.id, status: 'AVAILABLE' })}
                          className="rounded-lg bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-slate-800"
                        >
                          Mark Available
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this listing permanently?')) {
                            deleteListing.mutate(item.id);
                          }
                        }}
                        disabled={deleteListing.isPending}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-500 transition hover:bg-rose-50"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-800">
            Calls are routed to the Flee Market admin number set in the Super Admin settings.
          </div>
        </div>
      )}
    </div>
  );
}
