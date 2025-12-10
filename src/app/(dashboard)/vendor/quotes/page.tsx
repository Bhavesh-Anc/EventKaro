import { getVendorByUserId, getVendorQuoteRequests } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function VendorQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const params = await searchParams;
  const allQuotes = await getVendorQuoteRequests(vendor.id);

  // Filter by status if specified
  let filteredQuotes = allQuotes;
  if (params.status) {
    filteredQuotes = allQuotes.filter((q: any) => q.status === params.status);
  }

  // Group quotes by status for stats
  const pendingCount = allQuotes.filter((q: any) => q.status === 'pending').length;
  const quotedCount = allQuotes.filter((q: any) => q.status === 'quoted').length;
  const acceptedCount = allQuotes.filter((q: any) => q.status === 'accepted').length;
  const rejectedCount = allQuotes.filter((q: any) => q.status === 'rejected').length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/vendor/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Quote Requests</h2>
        <p className="text-muted-foreground">Manage all your quote requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-5">
        <Link
          href="/vendor/quotes"
          className={`rounded-lg border p-4 hover:bg-muted transition-colors ${
            !params.status ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
          <p className="mt-2 text-2xl font-bold">{allQuotes.length}</p>
        </Link>
        <Link
          href="/vendor/quotes?status=pending"
          className={`rounded-lg border p-4 hover:bg-muted transition-colors ${
            params.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
          <p className="mt-2 text-2xl font-bold text-yellow-700">{pendingCount}</p>
        </Link>
        <Link
          href="/vendor/quotes?status=quoted"
          className={`rounded-lg border p-4 hover:bg-muted transition-colors ${
            params.status === 'quoted' ? 'border-blue-200 bg-blue-50' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-blue-700">Quoted</h3>
          <p className="mt-2 text-2xl font-bold text-blue-700">{quotedCount}</p>
        </Link>
        <Link
          href="/vendor/quotes?status=accepted"
          className={`rounded-lg border p-4 hover:bg-muted transition-colors ${
            params.status === 'accepted' ? 'border-green-200 bg-green-50' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-green-700">Accepted</h3>
          <p className="mt-2 text-2xl font-bold text-green-700">{acceptedCount}</p>
        </Link>
        <Link
          href="/vendor/quotes?status=rejected"
          className={`rounded-lg border p-4 hover:bg-muted transition-colors ${
            params.status === 'rejected' ? 'border-red-200 bg-red-50' : ''
          }`}
        >
          <h3 className="text-sm font-medium text-red-700">Rejected</h3>
          <p className="mt-2 text-2xl font-bold text-red-700">{rejectedCount}</p>
        </Link>
      </div>

      {/* Quote List */}
      <div className="rounded-lg border">
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No quote requests found</h3>
            <p className="text-muted-foreground">
              {params.status
                ? `No ${params.status} quote requests at the moment.`
                : 'Quote requests will appear here once clients request quotes from you.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="border-b p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredQuotes.length} of {allQuotes.length} quote requests
                {params.status && ` (${params.status})`}
              </p>
            </div>
            <div className="divide-y">
              {filteredQuotes.map((quote: any) => (
                <div key={quote.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {quote.event?.title || 'Event Request'}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                quote.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : quote.status === 'quoted'
                                  ? 'bg-blue-100 text-blue-800'
                                  : quote.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : quote.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {quote.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(quote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Service Type:</span>{' '}
                          <span className="font-medium">{quote.service_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Event Date:</span>{' '}
                          <span className="font-medium">
                            {new Date(quote.event_date).toLocaleDateString()}
                          </span>
                        </div>
                        {quote.guest_count && (
                          <div>
                            <span className="text-muted-foreground">Guest Count:</span>{' '}
                            <span className="font-medium">{quote.guest_count}</span>
                          </div>
                        )}
                        {quote.venue_location && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>{' '}
                            <span className="font-medium">{quote.venue_location}</span>
                          </div>
                        )}
                        {quote.budget_range && (
                          <div>
                            <span className="text-muted-foreground">Budget:</span>{' '}
                            <span className="font-medium">{quote.budget_range}</span>
                          </div>
                        )}
                        {quote.event?.venue_name && (
                          <div>
                            <span className="text-muted-foreground">Venue:</span>{' '}
                            <span className="font-medium">{quote.event.venue_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {quote.message && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm font-medium mb-1">Client Message:</p>
                          <p className="text-sm text-muted-foreground">{quote.message}</p>
                        </div>
                      )}

                      {/* Your Response */}
                      {quote.vendor_response && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Your Response:</p>
                            {quote.quoted_price_inr && (
                              <span className="text-lg font-bold text-primary">
                                ₹{(quote.quoted_price_inr / 100).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {quote.vendor_response}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Responded on {new Date(quote.response_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {quote.status === 'pending' && (
                        <Link
                          href={`/vendor/quotes/${quote.id}/respond`}
                          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 text-center whitespace-nowrap"
                        >
                          Respond to Quote
                        </Link>
                      )}
                      <Link
                        href={`/vendor/quotes/${quote.id}`}
                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted text-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
