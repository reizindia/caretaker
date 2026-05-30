'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ArrowRight, Phone, Soup, UtensilsCrossed } from 'lucide-react';

export default function FoodPage() {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => apiClient.get('/hotels').then((r) => r.data),
  });

  return (
    <div className="p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-950">Order Food</h1>
        <p className="text-xs font-medium text-slate-400">Select a restaurant to browse their menu</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !hotels?.length ? (
        <EmptyState
          icon={<UtensilsCrossed size={26} />}
          title="No restaurants available"
          description="Restaurants will appear here once the admin adds them"
        />
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel: any) => (
            <Link
              key={hotel.id}
              href={`/resident/food/${hotel.id}`}
              className="card block overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] active:scale-[0.98]"
            >
              {/* Restaurant Image */}
              {hotel.imageUrl ? (
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center bg-orange-50 text-orange-200">
                  <Soup size={36} />
                </div>
              )}

              {/* Restaurant Info */}
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-950">{hotel.name}</h2>
                  {hotel.description && (
                    <p className="mt-0.5 truncate text-sm text-slate-400">{hotel.description}</p>
                  )}
                  {hotel.phone && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Phone size={11} />
                      {hotel.phone}
                    </p>
                  )}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition-colors group-hover:border-slate-200">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
