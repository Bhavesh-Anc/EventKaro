'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteVendorPackage } from '@/actions/vendors';
import { useRouter } from 'next/navigation';

interface PackagesListProps {
  packages: any[];
  vendorId: string;
}

export function PackagesList({ packages, vendorId }: PackagesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return;
    }

    setDeletingId(packageId);
    const result = await deleteVendorPackage(packageId, vendorId);

    if (result.error) {
      alert(`Error: ${result.error}`);
      setDeletingId(null);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`rounded-lg border p-6 hover:shadow-md transition-shadow ${
            pkg.is_popular ? 'border-primary border-2 bg-primary/5' : ''
          }`}
        >
          {pkg.is_popular && (
            <div className="mb-3">
              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                ⭐ Popular
              </span>
            </div>
          )}

          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{pkg.package_name}</h3>
              {(pkg.min_guests || pkg.max_guests) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pkg.min_guests && pkg.max_guests
                    ? `${pkg.min_guests}-${pkg.max_guests} guests`
                    : pkg.min_guests
                    ? `Min ${pkg.min_guests} guests`
                    : `Up to ${pkg.max_guests} guests`}
                </p>
              )}
            </div>
            {pkg.price_inr && (
              <span className="text-xl font-bold text-primary">
                ₹{(pkg.price_inr / 100).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {pkg.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {pkg.description}
            </p>
          )}

          {pkg.features && pkg.features.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Includes:</p>
              <ul className="space-y-1">
                {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
                {pkg.features.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{pkg.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Link
              href={`/vendor/packages/${pkg.id}/edit`}
              className="flex-1 text-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(pkg.id)}
              disabled={deletingId === pkg.id}
              className="flex-1 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingId === pkg.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
