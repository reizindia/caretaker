'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ImageUploadField from '@/components/shared/ImageUploadField';
import toast from 'react-hot-toast';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';

function ItemForm({ item, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: item?.name || '', description: item?.description || '', price: item?.price || '',
    category: item?.category || '', imageUrl: item?.imageUrl || '', stockStatus: item?.stockStatus || 'IN_STOCK', isActive: item?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) { await apiClient.patch(`/grocery/items/${item.id}`, form); toast.success('Item updated'); }
      else { await apiClient.post('/grocery/items', form); toast.success('Item created'); }
      onSave(); onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Add'} Grocery Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <ImageUploadField label="Item Image" value={form.imageUrl} folder="grocery" onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AdminGroceryPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['grocery-items-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/grocery/items').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  return (
    <div>
      <PageHeader title="Grocery Items" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} action={selectedFlat ? <button className="btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>+ Add Item</button> : undefined} />
      {showForm && <ItemForm item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['grocery-items-admin', selectedFlat?.slug] })} />}

      {!selectedFlat ? (
        <EmptyState title="Select a flat from the sidebar" />
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
