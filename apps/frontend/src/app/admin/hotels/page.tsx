'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ImageUploadField from '@/components/shared/ImageUploadField';
import toast from 'react-hot-toast';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';

function HotelForm({ hotel, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: hotel?.name || '', description: hotel?.description || '', phone: hotel?.phone || '', imageUrl: hotel?.imageUrl || '', isActive: hotel?.isActive ?? true });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (hotel) { await apiClient.patch(`/hotels/${hotel.id}`, form); toast.success('Updated'); }
      else { await apiClient.post('/hotels', form); toast.success('Created'); }
      onSave(); onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{hotel ? 'Edit' : 'Add'} Hotel</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <ImageUploadField label="Hotel Image" value={form.imageUrl} folder="hotels" onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

function FoodItemForm({ hotel, item, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: item?.name || '', description: item?.description || '', price: item?.price || '', category: item?.category || '', imageUrl: item?.imageUrl || '', isAvailable: item?.isAvailable ?? true });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) { await apiClient.patch(`/foods/${item.id}`, form); toast.success('Updated'); }
      else { await apiClient.post(`/hotels/${hotel.id}/foods`, form); toast.success('Created'); }
      onSave(); onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Add'} Food Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Price (₹) *</label><input className="input-field" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Category</label><input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <ImageUploadField label="Food Image" value={form.imageUrl} folder="food" onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AdminHotelsPage() {
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [editHotel, setEditHotel] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editFood, setEditFood] = useState<any>(null);
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    setSelectedHotel(null);
    setEditFood(null);
    setShowFoodForm(false);
  }, [selectedFlat?.slug]);

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/hotels').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });
  const { data: foods, isLoading: foodsLoading } = useQuery({
    queryKey: ['foods-admin', selectedFlat?.slug, selectedHotel?.id],
    queryFn: () => apiClient.get(`/hotels/${selectedHotel.id}/foods`).then((r) => r.data),
    enabled: !!selectedHotel && !!selectedFlat?.slug,
  });

  return (
    <div>
      <PageHeader title="Hotels & Food" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} action={selectedFlat ? <button className="btn-primary" onClick={() => { setEditHotel(null); setShowHotelForm(true); }}>+ Add Hotel</button> : undefined} />
      {showHotelForm && <HotelForm hotel={editHotel} onClose={() => { setShowHotelForm(false); setEditHotel(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['hotels-admin', selectedFlat?.slug] })} />}
      {showFoodForm && <FoodItemForm hotel={selectedHotel} item={editFood} onClose={() => { setShowFoodForm(false); setEditFood(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['foods-admin', selectedFlat?.slug, selectedHotel?.id] })} />}

      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : isLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">Hotels</h2>
            <div className="space-y-2">
              {hotels?.map((hotel: any) => (
                <div key={hotel.id} className={`card cursor-pointer border-2 ${selectedHotel?.id === hotel.id ? 'border-blue-500' : 'border-transparent'}`} onClick={() => setSelectedHotel(hotel)}>
                  <div className="flex justify-between">
                    <div><p className="font-medium">{hotel.name}</p><p className="text-sm text-gray-500">{hotel.description}</p></div>
                    <button className="text-blue-600 text-xs" onClick={(e) => { e.stopPropagation(); setEditHotel(hotel); setShowHotelForm(true); }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedHotel && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">{selectedHotel.name} — Menu</h2>
                <button className="btn-primary text-sm py-1 px-3" onClick={() => { setEditFood(null); setShowFoodForm(true); }}>+ Add Food</button>
              </div>
              {foodsLoading ? <LoadingSpinner /> : !foods?.length ? <EmptyState title="No food items" /> : (
                <div className="space-y-2">
                  {foods.map((food: any) => (
                    <div key={food.id} className="card flex justify-between items-center">
                      <div><p className="font-medium text-sm">{food.name}</p><p className="text-xs text-gray-500">{food.category}</p><p className="text-blue-600 text-sm font-bold">₹{Number(food.price).toFixed(2)}</p></div>
                      <button className="text-blue-600 text-xs" onClick={() => { setEditFood(food); setShowFoodForm(true); }}>Edit</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
