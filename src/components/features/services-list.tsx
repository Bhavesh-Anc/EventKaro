'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteVendorService } from '@/actions/vendors';
import { useRouter } from 'next/navigation';

interface ServicesListProps {
  services: any[];
  vendorId: string;
}

export function ServicesList({ services, vendorId }: ServicesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setDeletingId(serviceId);
    const result = await deleteVendorService(serviceId, vendorId);

    if (result.error) {
      alert(`Error: ${result.error}`);
      setDeletingId(null);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <div
          key={service.id}
          className="rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{service.service_name}</h3>
              {service.unit && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Per {service.unit}
                </p>
              )}
            </div>
            {service.price_inr && (
              <span className="text-xl font-bold text-primary">
                ₹{(service.price_inr / 100).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {service.description}
            </p>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Link
              href={`/vendor/services/${service.id}/edit`}
              className="flex-1 text-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(service.id)}
              disabled={deletingId === service.id}
              className="flex-1 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingId === service.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
