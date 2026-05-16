'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

function ItemForm({ item, flatId, onClose, onSave }: any) {
  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const [form, setForm] = useState({
    name: item?.name || '', description: item?.description || '', price: item?.price || '',
    category: item?.category || '', imageUrl: item?.imageUrl || '', stockStatus: item?.stockStatus || 'IN_STOCK', isActive: item?.isActive ?? true,
    flatId: item?.flatId || flatId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = form.flatId ? { 'X-Tenant-Slug': flatsData?.flats?.find((f: any) => f.id === form.flatId)?.slug } : {};
      if (item) { await apiClient.patch(`/grocery/items/${item.id}`, form, { headers }); toast.success('Item updated'); }
      else { await apiClient.post('/grocery/items', form, { headers }); toast.success('Item created'); }
      onSave(); onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Add'} Grocery Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Flat *</label>
            <select className="input-field" required value={form.flatId} onChange={(e) => setForm({ ...form, flatId: e.target.value })}>
              <option value="">Select flat</option>
              {flatsData?.flats?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Price (₹) *</label><input className="input-field" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Category</label><input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Status</label>
              <select className="input-field" value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}>
                <option value="IN_STOCK">In Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Image URL</label><input className="input-field" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AdminGroceryPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [flatFilter, setFlatFilter] = useState('');
  const [flatSlug, setFlatSlug] = useState('');
  const queryClient = useQueryClient();

  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });

  const { data, isLoading } = useQuery({
    queryKey: ['grocery-items-admin', flatSlug],
    queryFn: () => apiClient.get('/grocery/items', { headers: flatSlug ? { 'X-Tenant-Slug': flatSlug } : {} }).then((r) => r.data),
    enabled: !!flatSlug,
  });

  const onFlatChange = (flatId: string) => {
    setFlatFilter(flatId);
    const flat = flatsData?.flats?.find((f: any) => f.id === flatId);
    setFlatSlug(flat?.slug || '');
  };

  return (
    <div>
      <PageHeader title="Grocery Items" action={<button className="btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>+ Add Item</button>} />
      {showForm && <ItemForm item={editItem} flatId={flatFilter} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['grocery-items-admin'] })} />}

      <div className="mb-4">
        <select className="input-field w-auto" value={flatFilter} onChange={(e) => onFlatChange(e.target.value)}>
          <option value="">Select a flat to view items</option>
          {flatsData?.flats?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {!flatSlug ? (
        <EmptyState title="Select a flat to manage grocery items" />
      ) : isLoading ? <LoadingSpinner /> : !data?.length ? <EmptyState title="No items found" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-gray-500 text-xs">{item.category}</p>
              <p className="text-blue-600 font-bold mt-1">₹{Number(item.price).toFixed(2)}</p>
              <div className="mt-2 flex gap-2 items-center">
                <StatusBadge status={item.stockStatus} />
                <button className="text-blue-600 text-xs hover:underline" onClick={() => { setEditItem(item); setShowForm(true); }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
