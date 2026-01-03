import { getUserFavoriteVendors } from '@/actions/vendors';
import Link from 'next/link';
import { VendorCard } from '@/components/features/vendor-card';
import { EmptyState } from '@/components/ui/empty-state';

export default async function SavedVendorsPage() {
  const savedVendors = await getUserFavoriteVendors();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Saved Vendors</h2>
          <p className="text-muted-foreground">
            Your favorite vendors for quick access
          </p>
        </div>
        <Link
          href="/vendors"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse Marketplace
        </Link>
      </div>

      {savedVendors.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No saved vendors yet"
          description="Browse the vendor marketplace and save vendors you're interested in for quick access later"
          action={{
            label: "Browse Vendors",
            href: "/vendors"
          }}
        />
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {savedVendors.length} saved vendor{savedVendors.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-lg bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 p-6">
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/vendors"
            className="text-sm text-primary hover:underline font-medium"
          >
            Browse All Vendors
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/vendors?type=photographer"
            className="text-sm text-primary hover:underline font-medium"
          >
            Find Photographers
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/vendors?type=caterer"
            className="text-sm text-primary hover:underline font-medium"
          >
            Find Caterers
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/vendors?type=decorator"
            className="text-sm text-primary hover:underline font-medium"
          >
            Find Decorators
          </Link>
        </div>
      </div>
    </div>
  );
}
