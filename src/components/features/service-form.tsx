'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ServiceFormProps {
  vendorId: string;
  service?: any;
  action: (formData: FormData) => Promise<{ data?: any; error?: string; success?: boolean }>;
}

export function ServiceForm({ vendorId, service, action }: ServiceFormProps) {
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
        router.push('/vendor/services');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="vendor_id" value={vendorId} />
      {service && <input type="hidden" name="service_id" value={service.id} />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-lg border p-6 space-y-6">
        <div>
          <Label htmlFor="service_name">Service Name *</Label>
          <Input
            id="service_name"
            name="service_name"
            type="text"
            required
            disabled={isPending}
            defaultValue={service?.service_name || ''}
            placeholder="e.g., Full-Day Photo Coverage"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            disabled={isPending}
            defaultValue={service?.description || ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe what's included in this service, duration, special features, etc."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide details to help clients understand what they'll get
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₹) *</Label>
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
                defaultValue={service?.price_inr ? (service.price_inr / 100).toString() : ''}
                placeholder="25000"
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit">Unit (Optional)</Label>
            <Input
              id="unit"
              name="unit"
              type="text"
              disabled={isPending}
              defaultValue={service?.unit || ''}
              placeholder="e.g., day, hour, event"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g., "per day", "per hour"
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
          {isPending ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
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
