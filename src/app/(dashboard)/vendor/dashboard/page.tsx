import { getVendorByUserId } from '@/actions/vendors';
import { getVendorQuoteRequests } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const quoteRequests = await getVendorQuoteRequests(vendor.id);

  // Calculate stats
  const pendingQuotes = quoteRequests.filter((q: any) => q.status === 'pending').length;
  const quotedQuotes = quoteRequests.filter((q: any) => q.status === 'quoted').length;
  const acceptedQuotes = quoteRequests.filter((q: any) => q.status === 'accepted').length;

  // Profile completion percentage
  const profileFields = [
    vendor.business_name,
    vendor.description,
    vendor.phone,
    vendor.city,
    vendor.tagline,
    vendor.price_range,
    vendor.years_in_business,
    vendor.gst_number,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h2>
          <p className="text-muted-foreground">{vendor.business_name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/vendors/${vendor.id}`}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            View Public Profile
          </Link>
          <Link
            href="/vendor/profile"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Verification Status */}
      {!vendor.is_verified && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Get Verified</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Verified vendors get 3x more quote requests! Submit your documents to get the verified badge.
              </p>
              <button className="mt-3 text-sm text-yellow-900 underline font-medium">
                Apply for Verification →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Complete Your Profile</h3>
            <span className="text-sm font-medium text-primary">{profileCompletion}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <div className="flex gap-2">
            <Link
              href="/vendor/profile"
              className="text-sm text-primary hover:underline"
            >
              Complete your profile to get more visibility →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Quote Requests</h3>
          <p className="mt-2 text-3xl font-bold">{quoteRequests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Pending Quotes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">{pendingQuotes}</p>
          <p className="text-xs text-yellow-600 mt-1">Needs response</p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Quoted</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">{quotedQuotes}</p>
          <p className="text-xs text-blue-600 mt-1">Awaiting client</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Accepted</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">{acceptedQuotes}</p>
          <p className="text-xs text-green-600 mt-1">Confirmed bookings</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold">
              {vendor.average_rating > 0 ? vendor.average_rating.toFixed(1) : '--'}
            </p>
            <span className="text-yellow-600">⭐</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {vendor.total_reviews} reviews
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Completed Bookings</h3>
          <p className="mt-2 text-3xl font-bold">{vendor.completed_bookings}</p>
          <p className="text-xs text-muted-foreground mt-1">Total events serviced</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Profile Views</h3>
          <p className="mt-2 text-3xl font-bold">--</p>
          <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
        </div>
      </div>

      {/* Recent Quote Requests */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Quote Requests</h3>
          <Link
            href="/vendor/quotes"
            className="text-sm text-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        {quoteRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No quote requests yet</p>
            <p className="text-sm text-muted-foreground">
              Complete your profile and add services to start receiving quote requests!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quoteRequests.slice(0, 5).map((quote: any) => (
              <div
                key={quote.id}
                className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{quote.event?.title || 'Event'}</h4>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          quote.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : quote.status === 'quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : quote.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {quote.service_type} • {new Date(quote.event_date).toLocaleDateString()}
                    </p>
                    {quote.guest_count && (
                      <p className="text-xs text-muted-foreground">
                        Expected guests: {quote.guest_count}
                      </p>
                    )}
                    {quote.message && (
                      <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                        "{quote.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/vendor/quotes/${quote.id}`}
                      className="text-sm text-primary hover:underline whitespace-nowrap"
                    >
                      View Details →
                    </Link>
                    {quote.status === 'pending' && (
                      <Link
                        href={`/vendor/quotes/${quote.id}/respond`}
                        className="text-sm rounded-md bg-primary px-3 py-1.5 text-center text-primary-foreground hover:bg-primary/90"
                      >
                        Respond
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/vendor/services"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-medium">Manage Services</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Add or edit your services
            </p>
          </Link>
          <Link
            href="/vendor/packages"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-medium">Manage Packages</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Create pricing packages
            </p>
          </Link>
          <Link
            href="/vendor/reviews"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="font-medium">View Reviews</h4>
            <p className="text-xs text-muted-foreground mt-1">
              See what clients say
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
