'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

function FlatForm({ flat, onClose, onSave }: { flat?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: flat?.name || '',
    slug: flat?.slug || '',
    address: flat?.address || '',
    contactPerson: flat?.contactPerson || '',
    contactPhone: flat?.contactPhone || '',
    logoUrl: flat?.logoUrl || '',
    themeColor: flat?.themeColor || '#3B82F6',
    status: flat?.status || 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (flat) {
        await apiClient.patch(`/flats/${flat.id}`, form);
        toast.success('Flat updated');
      } else {
        await apiClient.post('/flats', form);
        toast.success('Flat created! URL: ' + form.slug + '.caretakerapp.com');
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error saving flat');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{flat ? 'Edit Flat' : 'Add New Flat'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Apartment Name *</label>
                <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug / Subdomain *</label>
                <input className="input-field" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. greenview" />
                {form.slug && <p className="text-xs text-blue-600 mt-1">URL: {form.slug}.caretakerapp.com</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <input className="input-field" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input className="input-field" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input className="input-field" type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme Color</label>
                <input className="input-field" type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Save Flat</button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function FlatsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editFlat, setEditFlat] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['flats'],
    queryFn: () => apiClient.get('/flats').then((r) => r.data),
  });

  const toggleStatus = async (flat: any) => {
    const newStatus = flat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.patch(`/flats/${flat.id}/status`, { status: newStatus });
      toast.success(`Flat ${newStatus.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['flats'] });
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader
        title="Flats / Apartments"
        description="Manage all apartment tenants"
        action={
          <button className="btn-primary" onClick={() => { setEditFlat(null); setShowForm(true); }}>
            + Add Flat
          </button>
        }
      />

      {showForm && (
        <FlatForm
          flat={editFlat}
          onClose={() => { setShowForm(false); setEditFlat(null); }}
          onSave={() => queryClient.invalidateQueries({ queryKey: ['flats'] })}
        />
      )}

      {!data?.flats?.length ? (
        <EmptyState title="No flats yet" description="Add your first apartment to get started" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Apartment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Slug / URL</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.flats.map((flat: any) => (
                <tr key={flat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: flat.themeColor || '#3B82F6' }}>
                        {flat.name[0]}
                      </div>
                      <span className="font-medium">{flat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-blue-600 text-xs">{flat.slug}.caretakerapp.com</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{flat.address || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{flat.contactPerson || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={flat.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-xs" onClick={() => { setEditFlat(flat); setShowForm(true); }}>Edit</button>
                      <button className="text-orange-600 hover:underline text-xs" onClick={() => toggleStatus(flat)}>
                        {flat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
