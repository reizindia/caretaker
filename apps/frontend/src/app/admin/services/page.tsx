'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ImageUploadField from '@/components/shared/ImageUploadField';
import toast from 'react-hot-toast';
import { useAdminFlatStore } from '@/lib/store/admin-flat.store';

function ServiceForm({ service, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: service?.name || '', description: service?.description || '', basePrice: service?.basePrice || '', imageUrl: service?.imageUrl || '', isActive: service?.isActive ?? true });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (service) { await apiClient.patch(`/services/${service.id}`, form); toast.success('Updated'); }
      else { await apiClient.post('/services', form); toast.success('Created'); }
      onSave(); onClose();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{service ? 'Edit' : 'Add'} Service</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Base Price (₹)</label><input className="input-field" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} /></div>
          <ImageUploadField label="Service Image" value={form.imageUrl} folder="services" onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const { selectedFlat } = useAdminFlatStore();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services-admin', selectedFlat?.slug],
    queryFn: () => apiClient.get('/services').then((r) => r.data),
    enabled: !!selectedFlat?.slug,
  });

  return (
    <div>
      <PageHeader title="Services" description={selectedFlat ? `Managing ${selectedFlat.name}` : 'Select an active flat from the sidebar'} action={selectedFlat ? <button className="btn-primary" onClick={() => { setEditService(null); setShowForm(true); }}>+ Add Service</button> : undefined} />
      {showForm && <ServiceForm service={editService} onClose={() => { setShowForm(false); setEditService(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['services-admin', selectedFlat?.slug] })} />}
      {!selectedFlat ? <EmptyState title="Select a flat from the sidebar" /> : isLoading ? <LoadingSpinner /> : !services?.length ? <EmptyState title="No services" /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((svc: any) => (
            <div key={svc.id} className="card">
              {svc.imageUrl && <img src={svc.imageUrl} alt={svc.name} className="w-full h-24 object-cover rounded-lg mb-2" />}
              <p className="font-medium">{svc.name}</p>
              <p className="text-sm text-gray-500">{svc.description}</p>
              {svc.basePrice && <p className="text-blue-600 font-bold mt-1">From ₹{Number(svc.basePrice).toFixed(2)}</p>}
              <button className="text-blue-600 text-xs mt-2 hover:underline" onClick={() => { setEditService(svc); setShowForm(true); }}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
