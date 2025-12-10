'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VendorFiltersProps {
  cities: string[];
  currentParams: any;
}

const businessTypes = [
  { value: 'caterer', label: 'Caterer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'decorator', label: 'Decorator' },
  { value: 'venue', label: 'Venue' },
  { value: 'dj', label: 'DJ' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
  { value: 'mehendi_artist', label: 'Mehendi Artist' },
  { value: 'florist', label: 'Florist' },
  { value: 'cake_designer', label: 'Cake Designer' },
  { value: 'wedding_planner', label: 'Wedding Planner' },
  { value: 'sound_lighting', label: 'Sound & Lighting' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const priceRanges = [
  { value: 'budget', label: 'Budget (₹)' },
  { value: 'moderate', label: 'Moderate (₹₹)' },
  { value: 'premium', label: 'Premium (₹₹₹)' },
  { value: 'luxury', label: 'Luxury (₹₹₹₹)' },
];

export function VendorFilters({ cities, currentParams }: VendorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/vendors?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/vendors');
  };

  const hasFilters = currentParams.type || currentParams.city || currentParams.price || currentParams.search;

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search vendors..."
            defaultValue={currentParams.search || ''}
            onChange={(e) => updateFilters('search', e.target.value)}
          />
        </div>

        {/* Business Type */}
        <div>
          <Label htmlFor="type">Vendor Type</Label>
          <select
            id="type"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={currentParams.type || ''}
            onChange={(e) => updateFilters('type', e.target.value)}
          >
            <option value="">All Types</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">City</Label>
          <select
            id="city"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={currentParams.city || ''}
            onChange={(e) => updateFilters('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <Label htmlFor="price">Price Range</Label>
          <select
            id="price"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={currentParams.price || ''}
            onChange={(e) => updateFilters('price', e.target.value)}
          >
            <option value="">All Prices</option>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
