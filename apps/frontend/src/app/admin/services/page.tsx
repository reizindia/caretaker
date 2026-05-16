'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

function ServiceForm({ service, flatSlug, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: service?.name || '', description: service?.description || '', basePrice: service?.basePrice || '', imageUrl: service?.imageUrl || '', isActive: service?.isActive ?? true });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { 'X-Tenant-Slug': flatSlug };
    try {
      if (service) { await apiClient.patch(`/services/${service.id}`, form, { headers }); toast.success('Updated'); }
      else { await apiClient.post('/services', form, { headers }); toast.success('Created'); }
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
          <div><label className="block text-sm font-medium mb-1">Image URL</label><input className="input-field" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Save</button><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [flatSlug, setFlatSlug] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const { data: services, isLoading } = useQuery({
    queryKey: ['services-admin', flatSlug],
    queryFn: () => apiClient.get('/services', { headers: { 'X-Tenant-Slug': flatSlug } }).then((r) => r.data),
    enabled: !!flatSlug,
  });

  return (
    <div>
      <PageHeader title="Services" action={flatSlug ? <button className="btn-primary" onClick={() => { setEditService(null); setShowForm(true); }}>+ Add Service</button> : undefined} />
      {showForm && <ServiceForm service={editService} flatSlug={flatSlug} onClose={() => { setShowForm(false); setEditService(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['services-admin'] })} />}
      <div className="mb-4"><select className="input-field w-auto" value={flatSlug} onChange={(e) => setFlatSlug(e.target.value)}><option value="">Select a flat</option>{flatsData?.flats?.map((f: any) => <option key={f.id} value={f.slug}>{f.name}</option>)}</select></div>
      {!flatSlug ? <EmptyState title="Select a flat" /> : isLoading ? <LoadingSpinner /> : !services?.length ? <EmptyState title="No services" /> : (
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
