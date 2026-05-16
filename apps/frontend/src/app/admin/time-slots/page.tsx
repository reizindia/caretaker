'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function AdminTimeSlotsPage() {
  const [flatSlug, setFlatSlug] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ serviceId: '', date: '', startTime: '', endTime: '', maxBookings: 3, isActive: true });
  const queryClient = useQueryClient();

  const { data: flatsData } = useQuery({ queryKey: ['flats-select'], queryFn: () => apiClient.get('/flats').then((r) => r.data) });
  const { data: services } = useQuery({
    queryKey: ['services-select', flatSlug],
    queryFn: () => apiClient.get('/services', { headers: { 'X-Tenant-Slug': flatSlug } }).then((r) => r.data),
    enabled: !!flatSlug,
  });
  const { data: slots, isLoading } = useQuery({
    queryKey: ['timeslots-admin', flatSlug, serviceId],
    queryFn: () => apiClient.get(`/time-slots?serviceId=${serviceId}`, { headers: { 'X-Tenant-Slug': flatSlug } }).then((r) => r.data),
    enabled: !!flatSlug && !!serviceId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/time-slots', { ...form, serviceId }, { headers: { 'X-Tenant-Slug': flatSlug } });
      toast.success('Time slot created');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['timeslots-admin'] });
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <PageHeader title="Time Slots" action={flatSlug && serviceId ? <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Time Slot</button> : undefined} />
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Time Slot</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Date *</label><input className="input-field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Start Time</label><input className="input-field" type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">End Time</label><input className="input-field" type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Max Bookings</label><input className="input-field" type="number" min="1" value={form.maxBookings} onChange={(e) => setForm({ ...form, maxBookings: +e.target.value })} /></div>
              <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Create</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select className="input-field w-auto" value={flatSlug} onChange={(e) => { setFlatSlug(e.target.value); setServiceId(''); }}><option value="">Select a flat</option>{flatsData?.flats?.map((f: any) => <option key={f.id} value={f.slug}>{f.name}</option>)}</select>
        {flatSlug && <select className="input-field w-auto" value={serviceId} onChange={(e) => setServiceId(e.target.value)}><option value="">Select service</option>{services?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
      </div>

      {!flatSlug || !serviceId ? <EmptyState title="Select a flat and service" /> : isLoading ? <LoadingSpinner /> : !slots?.length ? <EmptyState title="No time slots" /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Time</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Capacity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Booked</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {slots.map((slot: any) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{slot.date}</td>
                  <td className="px-4 py-3">{slot.startTime} – {slot.endTime}</td>
                  <td className="px-4 py-3">{slot.maxBookings}</td>
                  <td className="px-4 py-3">{slot.currentBookings}</td>
                  <td className="px-4 py-3">{slot.isActive ? <span className="text-green-600 text-xs font-medium">Active</span> : <span className="text-red-600 text-xs font-medium">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
