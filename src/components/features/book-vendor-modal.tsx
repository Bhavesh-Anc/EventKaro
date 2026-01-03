'use client';

import { useState, useTransition } from 'react';
import { createVendorBooking } from '@/actions/vendors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface BookVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  vendorId: string;
  vendorName: string;
  quoteRequestId?: string;
  quotedPrice?: number;
  eventDate: string;
}

export function BookVendorModal({
  isOpen,
  onClose,
  eventId,
  vendorId,
  vendorName,
  quoteRequestId,
  quotedPrice,
  eventDate,
}: BookVendorModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>(quotedPrice ? String(quotedPrice / 100) : '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    startTransition(async () => {
      const result = await createVendorBooking({
        eventId,
        vendorId,
        quoteRequestId,
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise
        bookingDate: eventDate,
        notes: notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Book Vendor</h2>
              <p className="text-muted-foreground">{vendorName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl"
            >
              x
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
              <p className="text-green-800 font-semibold text-lg">Vendor Booked!</p>
              <p className="text-green-700 text-sm mt-2">
                {vendorName} has been added to your event.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="amount">Booking Amount (INR) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  disabled={isPending}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter total amount"
                  min="0"
                  step="0.01"
                />
                {quotedPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Quoted price: Rs.{(quotedPrice / 100).toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bookingDate">Event Date</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  disabled
                  value={eventDate}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  From your event details
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  disabled={isPending}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will add {vendorName} to your booked vendors. You can track payments and communicate with them from the Event Vendors page.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
