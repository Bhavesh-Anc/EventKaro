'use client';

import { useState, useTransition } from 'react';
import { recordVendorPayment } from '@/actions/vendors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  vendorName: string;
  totalAmount: number;
  paidAmount: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  bookingId,
  vendorName,
  totalAmount,
  paidAmount,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'advance' | 'partial' | 'final' | 'full'>('partial');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const remainingBalance = totalAmount - paidAmount;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > remainingBalance / 100) {
      setError(`Payment cannot exceed remaining balance (Rs.${(remainingBalance / 100).toLocaleString('en-IN')})`);
      return;
    }

    startTransition(async () => {
      const result = await recordVendorPayment({
        bookingId,
        amount: Math.round(paymentAmount * 100), // Convert to paise
        paymentType,
        paymentMethod: paymentMethod || undefined,
        transactionId: transactionId || undefined,
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

  const handlePayFullBalance = () => {
    setAmount(String(remainingBalance / 100));
    setPaymentType('full');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Record Payment</h2>
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
              <p className="text-green-800 font-semibold text-lg">Payment Recorded!</p>
              <p className="text-green-700 text-sm mt-2">
                The payment has been logged successfully.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">Rs.{(totalAmount / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-medium text-green-600">Rs.{(paidAmount / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium">Remaining Balance:</span>
                  <span className="font-bold text-primary">Rs.{(remainingBalance / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount (INR) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    required
                    disabled={isPending}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    max={remainingBalance / 100}
                    step="0.01"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handlePayFullBalance}
                    className="px-3 py-2 text-xs font-medium bg-primary/10 text-primary rounded-md hover:bg-primary/20"
                  >
                    Pay Full
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentType">Payment Type *</Label>
                <select
                  id="paymentType"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  disabled={isPending}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="advance">Advance Payment</option>
                  <option value="partial">Partial Payment</option>
                  <option value="final">Final Payment</option>
                  <option value="full">Full Payment</option>
                </select>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select method...</option>
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS/RTGS)</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction ID / Reference</Label>
                <Input
                  id="transactionId"
                  type="text"
                  disabled={isPending}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., UTR number, cheque number"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={2}
                  disabled={isPending}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Recording...' : 'Record Payment'}
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
