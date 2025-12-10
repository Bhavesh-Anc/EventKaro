'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { respondToQuoteRequest } from '@/actions/vendors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface QuoteResponseFormProps {
  quoteId: string;
  budgetRange?: string | null;
}

export function QuoteResponseForm({ quoteId, budgetRange }: QuoteResponseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const quotedPrice = formData.get('quoted_price') as string;
    const vendorResponse = formData.get('vendor_response') as string;

    // Validation
    if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
      setError('Please enter a valid quoted price');
      return;
    }

    if (!vendorResponse || vendorResponse.trim().length < 20) {
      setError('Please provide a detailed response (at least 20 characters)');
      return;
    }

    startTransition(async () => {
      const result = await respondToQuoteRequest(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/vendor/quotes/${quoteId}`);
        }, 2000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="quote_request_id" value={quoteId} />

      {success ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
          <p className="text-green-800 font-semibold text-lg">✓ Response Sent Successfully!</p>
          <p className="text-green-700 text-sm mt-2">
            The client will be notified of your quote. Redirecting...
          </p>
        </div>
      ) : (
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Your Quote</h3>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="quoted_price">
              Quoted Price (₹) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="quoted_price"
                name="quoted_price"
                type="number"
                step="0.01"
                min="0"
                required
                disabled={isPending}
                placeholder="50000"
                className="pl-8"
              />
            </div>
            {budgetRange && (
              <p className="text-xs text-muted-foreground mt-1">
                Client's budget range: {' '}
                {budgetRange === 'under_50k' && 'Under ₹50,000'}
                {budgetRange === '50k_1l' && '₹50,000 - ₹1,00,000'}
                {budgetRange === '1l_2l' && '₹1,00,000 - ₹2,00,000'}
                {budgetRange === '2l_5l' && '₹2,00,000 - ₹5,00,000'}
                {budgetRange === 'above_5l' && 'Above ₹5,00,000'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="vendor_response">
              Your Response / Proposal *
            </Label>
            <textarea
              id="vendor_response"
              name="vendor_response"
              rows={8}
              required
              disabled={isPending}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Provide details about your service offering...

Include:
• What's included in the quoted price
• Your availability for the event date
• Relevant experience or past similar events
• Any additional services or packages available
• Timeline and next steps
• Contact information for follow-up questions"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific and professional. This is your chance to showcase your expertise!
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium text-sm mb-2">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Your quote will be sent to the client</li>
              <li>✓ The client can accept, reject, or contact you for more details</li>
              <li>✓ You'll be notified when the client responds</li>
              <li>✓ You can view the status in your Quotes dashboard</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? 'Sending Response...' : 'Send Quote Response'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
