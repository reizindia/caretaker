'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => apiClient.get('/services').then((r) => r.data) });
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedService?.id, selectedDate],
    queryFn: () => apiClient.get(`/time-slots?serviceId=${selectedService?.id}&date=${selectedDate}`).then((r) => r.data),
    enabled: !!selectedService && !!selectedDate,
  });

  const bookService = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await apiClient.post('/service-bookings', { serviceId: selectedService.id, timeSlotId: selectedSlot.id, notes });
      toast.success('Service booked successfully!');
      setSelectedService(null); setSelectedSlot(null); setNotes('');
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Book a Service</h1>

      {!selectedService ? (
        !services?.length ? <EmptyState title="No services available" /> : (
          <div className="grid grid-cols-2 gap-3">
            {services.map((svc: any) => (
              <button key={svc.id} onClick={() => setSelectedService(svc)} className="card text-left active:scale-95 transition-transform hover:border-blue-300 border border-transparent">
                {svc.imageUrl && <img src={svc.imageUrl} alt={svc.name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                <p className="font-medium text-sm">{svc.name}</p>
                <p className="text-xs text-gray-500">{svc.description}</p>
                {svc.basePrice && <p className="text-blue-600 text-xs font-bold mt-1">From ₹{Number(svc.basePrice).toFixed(2)}</p>}
              </button>
            ))}
          </div>
        )
      ) : (
        <div>
          <button onClick={() => setSelectedService(null)} className="text-blue-600 text-sm mb-4 flex items-center gap-1">← Back to services</button>
          <h2 className="font-bold text-lg mb-1">{selectedService.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{selectedService.description}</p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input type="date" className="input-field" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }} />
          </div>

          {slotsLoading ? <LoadingSpinner /> : !slots?.length ? (
            <EmptyState title="No time slots available for this date" />
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Available Time Slots</label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot: any) => {
                  const isFull = slot.currentBookings >= slot.maxBookings;
                  return (
                    <button key={slot.id} disabled={isFull} onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                        selectedSlot?.id === slot.id ? 'border-blue-600 bg-blue-50 text-blue-700' :
                        isFull ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' :
                        'border-gray-200 hover:border-blue-300'
                      }`}>
                      {slot.startTime} – {slot.endTime}
                      <br />
                      <span className="text-xs text-gray-500">{slot.maxBookings - slot.currentBookings} left</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSlot && (
            <div>
              <textarea className="input-field mb-4" rows={3} placeholder="Any special instructions? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <button onClick={bookService} disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Booking...' : `Book ${selectedService.name} at ${selectedSlot.startTime}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
