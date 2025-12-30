import { getAllVendors } from '@/actions/vendors';
import Link from 'next/link';
import { VendorCard } from '@/components/features/vendor-card';
import { VendorFilters } from '@/components/features/vendor-filters';

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    city?: string;
    price?: string;
    search?: string;
    rating?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    verified?: string;
    available?: string;
  }>;
}) {
  const params = await searchParams;
  const vendors = await getAllVendors();

  // Filter vendors based on search params
  let filteredVendors = vendors;

  if (params.type) {
    filteredVendors = filteredVendors.filter(
      (v) => v.business_type === params.type
    );
  }

  if (params.city) {
    filteredVendors = filteredVendors.filter(
      (v) => v.city?.toLowerCase() === params.city?.toLowerCase()
    );
  }

  if (params.price) {
    filteredVendors = filteredVendors.filter(
      (v) => v.price_range === params.price
    );
  }

  if (params.search) {
    filteredVendors = filteredVendors.filter(
      (v) =>
        v.business_name.toLowerCase().includes(params.search!.toLowerCase()) ||
        v.description?.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  // Rating filter
  if (params.rating) {
    const minRating = parseFloat(params.rating);
    filteredVendors = filteredVendors.filter(
      (v) => (v.average_rating || 0) >= minRating
    );
  }

  // Custom price range filter
  if (params.minPrice) {
    const minPrice = parseInt(params.minPrice) * 100; // Convert to paise
    filteredVendors = filteredVendors.filter(
      (v) => !v.min_price_inr || v.min_price_inr >= minPrice
    );
  }

  if (params.maxPrice) {
    const maxPrice = parseInt(params.maxPrice) * 100; // Convert to paise
    filteredVendors = filteredVendors.filter(
      (v) => !v.max_price_inr || v.max_price_inr <= maxPrice
    );
  }

  // Verified filter
  if (params.verified === 'true') {
    filteredVendors = filteredVendors.filter((v) => v.is_verified);
  }

  // Sort vendors
  const sortBy = params.sort || 'rating';
  filteredVendors.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'reviews':
        return (b.total_reviews || 0) - (a.total_reviews || 0);
      case 'price_low':
        return (a.min_price_inr || 0) - (b.min_price_inr || 0);
      case 'price_high':
        return (b.max_price_inr || 0) - (a.max_price_inr || 0);
      case 'popular':
        return (b.total_bookings || 0) - (a.total_bookings || 0);
      default:
        return (b.average_rating || 0) - (a.average_rating || 0);
    }
  });

  // Get unique cities for filter
  const cities = [...new Set(vendors.map((v) => v.city).filter(Boolean))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Marketplace</h2>
          <p className="text-muted-foreground">
            Find the perfect vendors for your event
          </p>
        </div>
        <Link
          href="/vendor-signup"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Become a Vendor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Vendors</h3>
          <p className="mt-2 text-3xl font-bold">{vendors.length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Verified Vendors</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {vendors.filter((v) => v.is_verified).length}
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Categories</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {new Set(vendors.map((v) => v.business_type)).size}
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-purple-50">
          <h3 className="text-sm font-medium text-purple-700">Cities</h3>
          <p className="mt-2 text-3xl font-bold text-purple-700">{cities.length}</p>
        </div>
      </div>

      {/* Vendor CTA Section - Moved up for better visibility */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Are you a vendor?</h3>
            <p className="text-sm md:text-base text-white/90">
              Join EventKaro marketplace and connect with thousands of event organizers across India
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/vendor-signup"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-purple-600 hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Register as Vendor
            </Link>
            <Link
              href="/vendor-login"
              className="rounded-md border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Vendor Login
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <VendorFilters cities={cities} currentParams={params} />

      {/* Vendor Grid */}
      {vendors.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Vendor Marketplace Coming Soon!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're building India's largest wedding vendor network. Be among the first vendors to join and get featured!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/vendors/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Register as First Vendor
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-2xl mx-auto text-left">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">📸</div>
              <h4 className="font-semibold text-gray-900">Photographers</h4>
              <p className="text-sm text-gray-500">Capture moments</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🍽️</div>
              <h4 className="font-semibold text-gray-900">Caterers</h4>
              <p className="text-sm text-gray-500">Culinary excellence</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900">Decorators</h4>
              <p className="text-sm text-gray-500">Transform venues</p>
            </div>
          </div>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
