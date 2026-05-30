'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

function UserForm({ user, flatId, role, onClose, onSave }: any) {
  const { data: flatsData } = useQuery({
    queryKey: ['flats-select'],
    queryFn: () => apiClient.get('/flats').then((r) => r.data),
  });

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: role || 'RESIDENT',
    flatId: user?.flatId || flatId || '',
    flatNumber: user?.flatNumber || '',
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await apiClient.patch(`/users/${user.id}`, form);
        toast.success('User updated');
      } else {
        await apiClient.post('/users', form);
        toast.success('User created');
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error saving user');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : `Add ${role || 'User'}`}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input className="input-field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label><input className="input-field" type="password" required={!user} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Flat *</label>
              <select className="input-field" required value={form.flatId} onChange={(e) => setForm({ ...form, flatId: e.target.value })}>
                <option value="">Select flat</option>
                {flatsData?.flats?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            {(form.role === 'RESIDENT') && <div><label className="block text-sm font-medium mb-1">Flat Number</label><input className="input-field" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} placeholder="e.g. A-101" /></div>}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResidentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [flatFilter, setFlatFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['residents', flatFilter],
    queryFn: () => apiClient.get(`/users?role=RESIDENT${flatFilter ? '&flatId=' + flatFilter : ''}`).then((r) => r.data),
  });

  const toggleStatus = async (user: any) => {
    try {
      await apiClient.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    } catch { toast.error('Failed'); }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader title="Residents" description="Manage all residents across flats" action={<button className="btn-primary" onClick={() => { setEditUser(null); setShowForm(true); }}>+ Add Resident</button>} />
      {showForm && <UserForm user={editUser} role="RESIDENT" onClose={() => { setShowForm(false); setEditUser(null); }} onSave={() => queryClient.invalidateQueries({ queryKey: ['residents'] })} />}

      <div className="mb-4">
        <select className="input-field w-auto" value={flatFilter} onChange={(e) => setFlatFilter(e.target.value)}>
          <option value="">All Flats</option>
          {flatsData?.flats?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {!data?.users?.length ? <EmptyState title="No residents found" /> : (
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Flat</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Unit</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{user.flat?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{user.flatNumber || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 text-xs hover:underline" onClick={() => { setEditUser(user); setShowForm(true); }}>Edit</button>
                      <button className="text-orange-600 text-xs hover:underline" onClick={() => toggleStatus(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</button>
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
