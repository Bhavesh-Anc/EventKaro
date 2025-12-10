'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PackageFormProps {
  vendorId: string;
  package?: any;
  action: (formData: FormData) => Promise<{ data?: any; error?: string; success?: boolean }>;
}

export function PackageForm({ vendorId, package: pkg, action }: PackageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/vendor/packages');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="vendor_id" value={vendorId} />
      {pkg && <input type="hidden" name="package_id" value={pkg.id} />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-lg border p-6 space-y-6">
        <div>
          <Label htmlFor="package_name">Package Name *</Label>
          <Input
            id="package_name"
            name="package_name"
            type="text"
            required
            disabled={isPending}
            defaultValue={pkg?.package_name || ''}
            placeholder="e.g., Wedding Essential Package"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            disabled={isPending}
            defaultValue={pkg?.description || ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Brief overview of what this package includes"
          />
        </div>

        <div>
          <Label htmlFor="price">Package Price (₹) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              disabled={isPending}
              defaultValue={pkg?.price_inr ? (pkg.price_inr / 100).toString() : ''}
              placeholder="75000"
              className="pl-8"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total package price
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_guests">Minimum Guests</Label>
            <Input
              id="min_guests"
              name="min_guests"
              type="number"
              min="0"
              disabled={isPending}
              defaultValue={pkg?.min_guests || ''}
              placeholder="50"
            />
          </div>

          <div>
            <Label htmlFor="max_guests">Maximum Guests</Label>
            <Input
              id="max_guests"
              name="max_guests"
              type="number"
              min="0"
              disabled={isPending}
              defaultValue={pkg?.max_guests || ''}
              placeholder="200"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="features">Features / What's Included *</Label>
          <textarea
            id="features"
            name="features"
            rows={8}
            required
            disabled={isPending}
            defaultValue={pkg?.features ? pkg.features.join('\n') : ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            placeholder="Enter one feature per line, for example:
Full-day photography coverage (8 hours)
Professional videography with drone shots
Premium photo album (50 pages)
Online photo gallery
Same-day highlights video"
          />
          <p className="text-xs text-muted-foreground mt-1">
            List each feature on a new line. These will appear as bullet points.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
          <input
            type="checkbox"
            id="is_popular"
            name="is_popular"
            value="true"
            disabled={isPending}
            defaultChecked={pkg?.is_popular || false}
            className="h-4 w-4 rounded border-gray-300"
          />
          <div className="flex-1">
            <Label htmlFor="is_popular" className="cursor-pointer">
              Mark as Popular Package
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Popular packages are highlighted with a special badge
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : pkg ? 'Update Package' : 'Create Package'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
