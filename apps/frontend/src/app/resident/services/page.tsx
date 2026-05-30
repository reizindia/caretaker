'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, Clock, Wrench } from 'lucide-react';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient.get('/services').then((r) => r.data),
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedService?.id, selectedDate],
    queryFn: () => apiClient.get(`/time-slots?serviceId=${selectedService?.id}&date=${selectedDate}`).then((r) => r.data),
    enabled: !!selectedService && !!selectedDate,
  });

  const bookService = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await apiClient.post('/service-bookings', {
        serviceId: selectedService.id,
        timeSlotId: selectedSlot.id,
        notes,
      });
      toast.success('Service booked successfully!');
      setSelectedService(null);
      setSelectedSlot(null);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {!selectedService ? (
        <>
          <div className="mb-5">
            <h1 className="text-xl font-bold text-slate-950">Book a Service</h1>
            <p className="text-xs font-medium text-slate-400">Choose from available services</p>
          </div>

          {!services?.length ? (
            <EmptyState icon={<Wrench size={26} />} title="No services available" description="Check back later." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {services.map((svc: any) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className="card overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] active:scale-[0.97]"
                >
                  {svc.imageUrl ? (
                    <img src={svc.imageUrl} alt={svc.name} className="h-24 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center bg-sky-50 text-sky-300">
                      <Wrench size={28} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800">{svc.name}</p>
                    {svc.description && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{svc.description}</p>
                    )}
                    {svc.basePrice && (
                      <p className="mt-1.5 text-xs font-bold text-sky-700">
                        From ₹{Number(svc.basePrice).toFixed(0)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {/* Back button */}
          <button
            onClick={() => { setSelectedService(null); setSelectedSlot(null); }}
            className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={15} />
            Back to services
          </button>

          {/* Service info */}
          <div className="card mb-4 overflow-hidden p-0">
            {selectedService.imageUrl && (
              <img src={selectedService.imageUrl} alt={selectedService.name} className="h-32 w-full object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-lg font-bold text-slate-950">{selectedService.name}</h2>
              {selectedService.description && (
                <p className="mt-1 text-sm text-slate-400">{selectedService.description}</p>
              )}
            </div>
          </div>

          {/* Date picker */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarDays size={13} /> Select Date
            </label>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
            />
          </div>

          {/* Slots */}
          {slotsLoading ? (
            <LoadingSpinner />
          ) : !slots?.length ? (
            <EmptyState
              icon={<Clock size={22} />}
              title="No time slots available"
              description="Try selecting a different date"
            />
          ) : (
            <div className="mb-4">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Clock size={13} /> Available Time Slots
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot: any) => {
                  const isFull = slot.currentBookings >= slot.maxBookings;
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                          : isFull
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {slot.startTime} – {slot.endTime}
                      <br />
                      <span className={`text-xs font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {slot.maxBookings - slot.currentBookings} spots left
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes + Book */}
          {selectedSlot && (
            <div className="space-y-3">
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Any special instructions? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                onClick={bookService}
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? 'Booking...' : `Book at ${selectedSlot.startTime}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
