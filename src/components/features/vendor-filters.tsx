'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

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
  { value: 'budget', label: 'Budget (₹)', min: 0, max: 25000 },
  { value: 'moderate', label: 'Moderate (₹₹)', min: 25000, max: 100000 },
  { value: 'premium', label: 'Premium (₹₹₹)', min: 100000, max: 500000 },
  { value: 'luxury', label: 'Luxury (₹₹₹₹)', min: 500000, max: null },
];

const ratingOptions = [
  { value: '4.5', label: '4.5★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '3.5', label: '3.5★ & above' },
  { value: '3', label: '3★ & above' },
];

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export function VendorFilters({ cities, currentParams }: VendorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/vendors?${params.toString()}`);
  };

  const updateMultipleFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/vendors?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/vendors');
  };

  const hasFilters =
    currentParams.type ||
    currentParams.city ||
    currentParams.price ||
    currentParams.search ||
    currentParams.rating ||
    currentParams.minPrice ||
    currentParams.maxPrice ||
    currentParams.sort;

  return (
    <div className="rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filter Vendors</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Primary Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-1.5 block">
            Search
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search vendors..."
            defaultValue={currentParams.search || ''}
            onChange={(e) => updateFilters('search', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Business Type */}
        <div>
          <Label htmlFor="type" className="text-sm font-medium mb-1.5 block">
            Vendor Type
          </Label>
          <select
            id="type"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          <Label htmlFor="city" className="text-sm font-medium mb-1.5 block">
            City
          </Label>
          <select
            id="city"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          <Label htmlFor="price" className="text-sm font-medium mb-1.5 block">
            Price Range
          </Label>
          <select
            id="price"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Advanced Filters Toggle */}
      <div className="pt-4 border-t">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
          {/* Rating Filter */}
          <div>
            <Label htmlFor="rating" className="text-sm font-medium mb-1.5 block">
              Minimum Rating
            </Label>
            <select
              id="rating"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={currentParams.rating || ''}
              onChange={(e) => updateFilters('rating', e.target.value)}
            >
              <option value="">Any Rating</option>
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <Label htmlFor="sort" className="text-sm font-medium mb-1.5 block">
              Sort By
            </Label>
            <select
              id="sort"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={currentParams.sort || 'rating'}
              onChange={(e) => updateFilters('sort', e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Price Range */}
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-sm font-medium mb-1.5 block">Custom Price Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                defaultValue={currentParams.minPrice || ''}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
                className="h-10"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                defaultValue={currentParams.maxPrice || ''}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Verified Only */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentParams.verified === 'true'}
                onChange={(e) => updateFilters('verified', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Verified Vendors Only</span>
            </label>
          </div>

          {/* Available Now */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentParams.available === 'true'}
                onChange={(e) => updateFilters('available', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Available Now</span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {currentParams.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Search: {currentParams.search}
                <button
                  onClick={() => updateFilters('search', '')}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            {currentParams.type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Type: {businessTypes.find((t) => t.value === currentParams.type)?.label}
                <button onClick={() => updateFilters('type', '')} className="hover:text-primary/80">
                  ×
                </button>
              </span>
            )}
            {currentParams.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                City: {currentParams.city}
                <button onClick={() => updateFilters('city', '')} className="hover:text-primary/80">
                  ×
                </button>
              </span>
            )}
            {currentParams.price && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Price: {priceRanges.find((p) => p.value === currentParams.price)?.label}
                <button onClick={() => updateFilters('price', '')} className="hover:text-primary/80">
                  ×
                </button>
              </span>
            )}
            {currentParams.rating && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Rating: {currentParams.rating}★+
                <button
                  onClick={() => updateFilters('rating', '')}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
            {currentParams.verified === 'true' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Verified Only
                <button
                  onClick={() => updateFilters('verified', '')}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
