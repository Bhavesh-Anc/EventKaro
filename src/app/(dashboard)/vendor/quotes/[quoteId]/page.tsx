import { getQuoteRequest, getVendorByUserId } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
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

  const { quoteId } = await params;
  const quote = await getQuoteRequest(quoteId);

  if (!quote || quote.vendor_id !== vendor.id) {
    redirect('/vendor/quotes');
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/vendor/quotes"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Quotes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Quote Request Details</h2>
            <p className="text-muted-foreground">
              Received on {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${
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
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {quote.status === 'pending' && (
        <div className="flex gap-3">
          <Link
            href={`/vendor/quotes/${quote.id}/respond`}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Respond to Quote Request
          </Link>
        </div>
      )}

      {/* Event Information */}
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Event Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Event Name</span>
            <p className="font-medium">{quote.event?.title || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Event Date</span>
            <p className="font-medium">
              {new Date(quote.event_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {quote.event?.venue_name && (
            <div>
              <span className="text-sm text-muted-foreground">Venue</span>
              <p className="font-medium">{quote.event.venue_name}</p>
            </div>
          )}
          {quote.venue_location && (
            <div>
              <span className="text-sm text-muted-foreground">Location</span>
              <p className="font-medium">{quote.venue_location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Service Requirements</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Service Type</span>
            <p className="font-medium">{quote.service_type}</p>
          </div>
          {quote.guest_count && (
            <div>
              <span className="text-sm text-muted-foreground">Expected Guests</span>
              <p className="font-medium">{quote.guest_count} people</p>
            </div>
          )}
          {quote.budget_range && (
            <div>
              <span className="text-sm text-muted-foreground">Client Budget Range</span>
              <p className="font-medium">
                {quote.budget_range === 'under_50k' && 'Under ₹50,000'}
                {quote.budget_range === '50k_1l' && '₹50,000 - ₹1,00,000'}
                {quote.budget_range === '1l_2l' && '₹1,00,000 - ₹2,00,000'}
                {quote.budget_range === '2l_5l' && '₹2,00,000 - ₹5,00,000'}
                {quote.budget_range === 'above_5l' && 'Above ₹5,00,000'}
              </p>
            </div>
          )}
        </div>

        {quote.message && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Client Message</span>
            <div className="mt-2 rounded-lg bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{quote.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Client Contact Information */}
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Client Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {quote.requester?.full_name && (
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{quote.requester.full_name}</p>
            </div>
          )}
          {quote.requester?.email && (
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-medium">
                <a
                  href={`mailto:${quote.requester.email}`}
                  className="text-primary hover:underline"
                >
                  {quote.requester.email}
                </a>
              </p>
            </div>
          )}
          {quote.requester?.phone && (
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="font-medium">
                <a
                  href={`tel:${quote.requester.phone}`}
                  className="text-primary hover:underline"
                >
                  {quote.requester.phone}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Your Response (if already responded) */}
      {quote.vendor_response && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Response</h3>
            {quote.quoted_price_inr && (
              <span className="text-2xl font-bold text-primary">
                ₹{(quote.quoted_price_inr / 100).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm whitespace-pre-wrap">{quote.vendor_response}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Responded on {new Date(quote.response_date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
