import Link from 'next/link';

interface VendorCardProps {
  vendor: any;
}

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

export function VendorCard({ vendor }: VendorCardProps) {
  const priceRangeIcons: Record<string, string> = {
    budget: '₹',
    moderate: '₹₹',
    premium: '₹₹₹',
    luxury: '₹₹₹₹',
  };

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
        {vendor.cover_image_url ? (
          <img
            src={vendor.cover_image_url}
            alt={vendor.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            {vendor.business_type === 'caterer' && '🍽️'}
            {vendor.business_type === 'photographer' && '📸'}
            {vendor.business_type === 'videographer' && '🎥'}
            {vendor.business_type === 'decorator' && '🎨'}
            {vendor.business_type === 'venue' && '🏛️'}
            {vendor.business_type === 'dj' && '🎧'}
            {vendor.business_type === 'makeup_artist' && '💄'}
            {vendor.business_type === 'mehendi_artist' && '🖐️'}
            {vendor.business_type === 'florist' && '🌸'}
            {vendor.business_type === 'cake_designer' && '🎂'}
            {vendor.business_type === 'wedding_planner' && '💍'}
            {vendor.business_type === 'sound_lighting' && '💡'}
            {vendor.business_type === 'entertainment' && '🎭'}
            {vendor.business_type === 'transport' && '🚗'}
            {!['caterer', 'photographer', 'videographer', 'decorator', 'venue', 'dj', 'makeup_artist', 'mehendi_artist', 'florist', 'cake_designer', 'wedding_planner', 'sound_lighting', 'entertainment', 'transport'].includes(vendor.business_type) && '⭐'}
          </div>
        )}
        {vendor.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ✓ Verified
          </div>
        )}
        {vendor.is_featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
          <p className="text-sm text-muted-foreground">
            {businessTypeLabels[vendor.business_type] || vendor.business_type}
          </p>
        </div>

        {vendor.tagline && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {vendor.tagline}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {vendor.city && (
            <span className="text-muted-foreground flex items-center gap-1">
              📍 {vendor.city}
            </span>
          )}
          {vendor.average_rating > 0 && (
            <span className="text-yellow-600 flex items-center gap-1 font-medium">
              ⭐ {vendor.average_rating.toFixed(1)}
              <span className="text-muted-foreground">
                ({vendor.total_reviews})
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          {vendor.price_range && (
            <span className="text-primary font-medium">
              {priceRangeIcons[vendor.price_range]}
            </span>
          )}
          {vendor.completed_bookings > 0 && (
            <span className="text-xs text-muted-foreground">
              {vendor.completed_bookings} completed bookings
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
