import { getVendor, getVendorReviews, isVendorFavorited } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FavoriteButton } from '@/components/features/favorite-button';
import { QuoteRequestButton } from '@/components/features/quote-request-button';
import { ReviewsList } from '@/components/features/reviews-list';

const businessTypeLabels: Record<string, string> = {
  caterer: 'Caterer',
  photographer: 'Photographer',
  videographer: 'Videographer',
  decorator: 'Decorator',
  venue: 'Venue',
  dj: 'DJ',
  makeup_artist: 'Makeup Artist',
  mehendi_artist: 'Mehendi Artist',
  florist: 'Florist',
  cake_designer: 'Cake Designer',
  wedding_planner: 'Wedding Planner',
  sound_lighting: 'Sound & Lighting',
  entertainment: 'Entertainment',
  transport: 'Transport',
  other: 'Other',
};

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const vendor = await getVendor(vendorId);
  const reviews = await getVendorReviews(vendorId);
  const isFavorited = await isVendorFavorited(vendorId);

  if (!vendor) {
    redirect('/vendors');
  }

  const priceRangeDisplay: Record<string, string> = {
    budget: '₹ Budget Friendly',
    moderate: '₹₹ Moderate',
    premium: '₹₹₹ Premium',
    luxury: '₹₹₹₹ Luxury',
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-lg border overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 relative">
          {vendor.cover_image_url && (
            <img
              src={vendor.cover_image_url}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
            />
          )}
          {vendor.is_verified && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              ✓ Verified Vendor
            </div>
          )}
          {vendor.is_featured && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              ⭐ Featured
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{vendor.business_name}</h1>
              <p className="text-xl text-muted-foreground mt-2">
                {businessTypeLabels[vendor.business_type] || vendor.business_type}
              </p>
              {vendor.tagline && (
                <p className="text-lg text-muted-foreground mt-2 italic">
                  "{vendor.tagline}"
                </p>
              )}

              <div className="flex items-center gap-6 mt-4 text-sm">
                {vendor.city && (
                  <span className="flex items-center gap-1">
                    📍 {vendor.city}{vendor.state && `, ${vendor.state}`}
                  </span>
                )}
                {vendor.average_rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600 font-medium">
                    ⭐ {vendor.average_rating.toFixed(1)} ({vendor.total_reviews} reviews)
                  </span>
                )}
                {vendor.completed_bookings > 0 && (
                  <span className="text-muted-foreground">
                    {vendor.completed_bookings} completed bookings
                  </span>
                )}
                {vendor.years_in_business && (
                  <span className="text-muted-foreground">
                    {vendor.years_in_business}+ years in business
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <FavoriteButton vendorId={vendorId} initialFavorited={isFavorited} />
              <QuoteRequestButton vendorId={vendorId} vendorName={vendor.business_name} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          {vendor.description && (
            <div className="rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">About Us</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {vendor.description}
              </p>
            </div>
          )}

          {/* Services */}
          {vendor.vendor_services && vendor.vendor_services.length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {vendor.vendor_services.map((service: any) => (
                  <div key={service.id} className="rounded-lg border p-4">
                    <h3 className="font-semibold">{service.service_name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    {service.price_inr && (
                      <p className="text-primary font-medium mt-2">
                        ₹{(service.price_inr / 100).toLocaleString('en-IN')}
                        {service.price_type && ` / ${service.price_type.replace('_', ' ')}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {vendor.vendor_packages && vendor.vendor_packages.length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">Packages</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {vendor.vendor_packages.map((pkg: any) => (
                  <div
                    key={pkg.id}
                    className={`rounded-lg border p-4 ${
                      pkg.is_popular ? 'border-primary border-2 bg-primary/5' : ''
                    }`}
                  >
                    {pkg.is_popular && (
                      <span className="inline-block bg-primary text-white px-2 py-1 rounded text-xs font-medium mb-2">
                        Popular
                      </span>
                    )}
                    <h3 className="font-semibold text-lg">{pkg.package_name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.description}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-primary mt-3">
                      ₹{(pkg.price_inr / 100).toLocaleString('en-IN')}
                    </p>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {pkg.features.slice(0, 5).map((feature: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {pkg.max_guests && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Up to {pkg.max_guests} guests
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-lg border p-6">
            <ReviewsList
              reviews={reviews}
              averageRating={vendor.average_rating}
              totalReviews={vendor.total_reviews}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="rounded-lg border p-6 space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>

            {vendor.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                  {vendor.phone}
                </a>
              </div>
            )}

            {vendor.whatsapp_number && (
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <a
                  href={`https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {vendor.whatsapp_number}
                </a>
              </div>
            )}

            {vendor.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                  {vendor.email}
                </a>
              </div>
            )}

            {vendor.website && (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {vendor.website}
                </a>
              </div>
            )}

            {vendor.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-sm">{vendor.address}</p>
                {vendor.pincode && (
                  <p className="text-sm text-muted-foreground">{vendor.pincode}</p>
                )}
              </div>
            )}
          </div>

          {/* Pricing Info */}
          {vendor.price_range && (
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-3">Pricing</h3>
              <p className="text-lg font-medium text-primary">
                {priceRangeDisplay[vendor.price_range]}
              </p>
              {vendor.starting_price_inr && (
                <p className="text-sm text-muted-foreground mt-2">
                  Starting from ₹{(vendor.starting_price_inr / 100).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}

          {/* Business Info */}
          <div className="rounded-lg border p-6 space-y-3">
            <h3 className="font-semibold text-lg">Business Details</h3>

            {vendor.team_size && (
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-sm font-medium">{vendor.team_size} members</p>
              </div>
            )}

            {vendor.gst_number && (
              <div>
                <p className="text-sm text-muted-foreground">GST Number</p>
                <p className="text-sm font-mono">{vendor.gst_number}</p>
              </div>
            )}

            {vendor.service_areas && vendor.service_areas.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Service Areas</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vendor.service_areas.map((area: string) => (
                    <span
                      key={area}
                      className="inline-block bg-muted px-2 py-1 rounded text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Media */}
          {(vendor.instagram_url || vendor.facebook_url || vendor.youtube_url) && (
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {vendor.instagram_url && (
                  <a
                    href={vendor.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-primary"
                  >
                    📷
                  </a>
                )}
                {vendor.facebook_url && (
                  <a
                    href={vendor.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-primary"
                  >
                    👥
                  </a>
                )}
                {vendor.youtube_url && (
                  <a
                    href={vendor.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-primary"
                  >
                    🎥
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
