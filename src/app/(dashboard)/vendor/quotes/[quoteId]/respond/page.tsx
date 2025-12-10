import { getQuoteRequest, getVendorByUserId } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { QuoteResponseForm } from '@/components/features/quote-response-form';

export default async function RespondToQuotePage({
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

  // Redirect if already responded
  if (quote.status !== 'pending') {
    redirect(`/vendor/quotes/${quoteId}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href={`/vendor/quotes/${quoteId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Quote Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Respond to Quote Request</h2>
        <p className="text-muted-foreground mt-2">
          Provide your pricing and details for this service request
        </p>
      </div>

      {/* Quote Summary */}
      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Request Summary</h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event:</span>
            <span className="font-medium">{quote.event?.title || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Type:</span>
            <span className="font-medium">{quote.service_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event Date:</span>
            <span className="font-medium">
              {new Date(quote.event_date).toLocaleDateString()}
            </span>
          </div>
          {quote.guest_count && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest Count:</span>
              <span className="font-medium">{quote.guest_count} people</span>
            </div>
          )}
          {quote.budget_range && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Budget:</span>
              <span className="font-medium">
                {quote.budget_range === 'under_50k' && 'Under ₹50,000'}
                {quote.budget_range === '50k_1l' && '₹50,000 - ₹1,00,000'}
                {quote.budget_range === '1l_2l' && '₹1,00,000 - ₹2,00,000'}
                {quote.budget_range === '2l_5l' && '₹2,00,000 - ₹5,00,000'}
                {quote.budget_range === 'above_5l' && 'Above ₹5,00,000'}
              </span>
            </div>
          )}
        </div>
        {quote.message && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Client Message:</p>
            <p className="text-sm">{quote.message}</p>
          </div>
        )}
      </div>

      {/* Response Form */}
      <QuoteResponseForm quoteId={quoteId} budgetRange={quote.budget_range} />

      {/* Tips Section */}
      <div className="rounded-lg border p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Tips for a Great Response</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span>💡</span>
            <span>Be specific about what's included in your quoted price</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>Mention your availability for the event date</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>Highlight your relevant experience or past events</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>Include any additional options or packages available</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>Be professional and respond promptly to increase booking chances</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
