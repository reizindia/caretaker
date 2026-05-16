'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function FoodPage() {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => apiClient.get('/hotels').then((r) => r.data),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Food</h1>
      <p className="text-sm text-gray-500 mb-4">Select a restaurant to browse their menu</p>

      {isLoading ? <LoadingSpinner /> : !hotels?.length ? (
        <EmptyState title="No restaurants available" description="Check back later" />
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel: any) => (
            <Link key={hotel.id} href={`/resident/food/${hotel.id}`} className="block card hover:shadow-md transition-shadow active:scale-98">
              {hotel.imageUrl && <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-36 object-cover rounded-lg mb-3" />}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{hotel.name}</h2>
                  <p className="text-sm text-gray-500">{hotel.description}</p>
                  {hotel.phone && <p className="text-xs text-gray-400 mt-1">📞 {hotel.phone}</p>}
                </div>
                <span className="text-blue-600 text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
