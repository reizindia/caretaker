'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ImageUploadField from '@/components/shared/ImageUploadField';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '';
const tenantUrl = (slug: string) => appDomain ? `${slug}.${appDomain}` : slug;

function FlatForm({ flat, onClose, onSave }: { flat?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: flat?.name || '',
    slug: flat?.slug || '',
    address: flat?.address || '',
    contactPerson: flat?.contactPerson || '',
    contactPhone: flat?.contactPhone || '',
    logoUrl: flat?.logoUrl || '',
    imageUrl: flat?.imageUrl || '',
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
        toast.success('Flat created: ' + tenantUrl(form.slug));
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error saving flat');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-950/20">
        <div className="relative h-36 overflow-hidden rounded-t-2xl bg-slate-950">
          {form.imageUrl ? (
            <img src={form.imageUrl} alt={form.name || 'Apartment'} className="absolute inset-0 h-full w-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a,#164e63)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{flat ? 'Edit Flat' : 'Add New Flat'}</h2>
              <p className="text-xs font-medium text-white/70">Apartment profile and branding</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Apartment Name *</label>
                <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug / Subdomain *</label>
                <input className="input-field" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. sunrise-towers" />
                {form.slug && <p className="text-xs text-blue-600 mt-1">URL: {tenantUrl(form.slug)}</p>}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ImageUploadField label="Flat Logo" value={form.logoUrl} folder="flats/logos" onChange={(logoUrl) => setForm({ ...form, logoUrl })} helperText="Shown where flat branding is used" />
              <div>
                <label className="block text-sm font-medium mb-1">Theme Color</label>
                <input className="input-field" type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} />
              </div>
            </div>
            <ImageUploadField label="Flat Image" value={form.imageUrl} folder="flats/images" onChange={(imageUrl) => setForm({ ...form, imageUrl })} helperText="Shown on login pages and logged-in top bars" />
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
        <div className="table-scroll">
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
                      {flat.imageUrl ? (
                        <img src={flat.imageUrl} alt={flat.name} className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: flat.themeColor || '#3B82F6' }}>
                          {flat.name[0]}
                        </div>
                      )}
                      <span className="font-medium">{flat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-blue-600 text-xs">{tenantUrl(flat.slug)}</div>
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
