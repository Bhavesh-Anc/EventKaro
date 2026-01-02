'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookVendorModal } from './book-vendor-modal';
import { RecordPaymentModal } from './record-payment-modal';
import { VendorQuoteComparison } from './vendor-quote-comparison';
import { updateVendorBookingStatus, acceptVendorQuote, rejectVendorQuote } from '@/actions/vendors';
import { EmptyState } from '@/components/ui/empty-state';

interface VendorBooking {
  id: string;
  vendor_id: string;
  event_id: string;
  amount_inr: number;
  status: string;
  notes?: string;
  created_at: string;
  vendor?: {
    id: string;
    business_name: string;
    business_type: string;
    city?: string;
    phone?: string;
    email?: string;
  };
  payment_status?: string;
  advance_paid_inr?: number;
}

interface QuoteRequest {
  id: string;
  vendor_id: string;
  event_id: string;
  service_type: string;
  status: string;
  message?: string;
  quoted_price_inr?: number;
  vendor_response?: string;
  created_at: string;
  vendor?: {
    id: string;
    business_name: string;
    business_type: string;
    city?: string;
    phone?: string;
    email?: string;
  };
}

interface EventVendorsStats {
  totalVendors: number;
  confirmedVendors: number;
  pendingQuotes: number;
  totalCost: number;
}

interface Props {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  vendorBookings: VendorBooking[];
  pendingQuotes: QuoteRequest[];
  stats: EventVendorsStats;
}

type ViewTab = 'bookings' | 'compare';

export function EventVendorsClient({
  eventId,
  eventTitle,
  eventDate,
  vendorBookings,
  pendingQuotes,
  stats,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ViewTab>('bookings');
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    vendorId: string;
    vendorName: string;
    quoteRequestId?: string;
    quotedPrice?: number;
  }>({
    isOpen: false,
    vendorId: '',
    vendorName: '',
  });

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    vendorName: string;
    totalAmount: number;
    paidAmount: number;
  }>({
    isOpen: false,
    bookingId: '',
    vendorName: '',
    totalAmount: 0,
    paidAmount: 0,
  });

  const handleRecordPayment = (booking: VendorBooking) => {
    setPaymentModal({
      isOpen: true,
      bookingId: booking.id,
      vendorName: booking.vendor?.business_name || 'Unknown Vendor',
      totalAmount: booking.amount_inr || 0,
      paidAmount: booking.advance_paid_inr || 0,
    });
  };

  const handleConfirmBooking = (bookingId: string) => {
    startTransition(async () => {
      await updateVendorBookingStatus(bookingId, 'confirmed');
      router.refresh();
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this vendor booking?')) {
      startTransition(async () => {
        await updateVendorBookingStatus(bookingId, 'cancelled');
        router.refresh();
      });
    }
  };

  const handleBookFromQuote = (quote: QuoteRequest) => {
    setBookingModal({
      isOpen: true,
      vendorId: quote.vendor_id,
      vendorName: quote.vendor?.business_name || 'Unknown Vendor',
      quoteRequestId: quote.id,
      quotedPrice: quote.quoted_price_inr,
    });
  };

  const handleAcceptQuote = async (quoteId: string) => {
    startTransition(async () => {
      await acceptVendorQuote(quoteId, eventId);
      router.refresh();
    });
  };

  const handleRejectQuote = async (quoteId: string) => {
    startTransition(async () => {
      await rejectVendorQuote(quoteId);
      router.refresh();
    });
  };

  const handleContactVendor = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`);
  };

  // Transform quotes to match VendorQuoteComparison expected format
  const quotesForComparison = pendingQuotes.map(q => ({
    id: q.id,
    vendor_id: q.vendor_id,
    vendor: {
      id: q.vendor?.id || '',
      business_name: q.vendor?.business_name || 'Unknown',
      business_type: q.vendor?.business_type || 'Other',
      city: q.vendor?.city || 'Unknown',
      phone: q.vendor?.phone,
      email: q.vendor?.email,
      average_rating: undefined,
      total_reviews: undefined,
    },
    service_type: q.service_type,
    status: q.status as 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired',
    quoted_price_inr: q.quoted_price_inr,
    vendor_response: q.vendor_response,
    created_at: q.created_at,
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          Back to Event
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendor Management</h2>
            <p className="text-sm text-muted-foreground">{eventTitle}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/vendors/saved"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted text-center shrink-0"
            >
              Saved Vendors
            </Link>
            <Link
              href="/vendors"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 text-center shrink-0"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Vendors</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalVendors}</p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Pending Quotes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">{stats.pendingQuotes}</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Confirmed</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">{stats.confirmedVendors}</p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Total Cost</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            Rs.{(stats.totalCost / 100).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Vendor Bookings
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'compare'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Quote Comparison
          {pendingQuotes.filter(q => q.status === 'quoted').length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {pendingQuotes.filter(q => q.status === 'quoted').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'compare' ? (
        <VendorQuoteComparison
          quotes={quotesForComparison}
          onAccept={handleAcceptQuote}
          onReject={handleRejectQuote}
          onContact={handleContactVendor}
        />
      ) : (
        <>
          {/* Booked Vendors */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Booked Vendors</h3>
        {vendorBookings.length === 0 ? (
          <EmptyState
            icon="store"
            title="No vendors booked yet"
            description="Browse the vendor marketplace to find and book vendors for your event"
            action={{
              label: "Browse Vendors",
              href: "/vendors"
            }}
          />
        ) : (
          <div className="space-y-4">
            {vendorBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/vendors/${booking.vendor_id}`}
                        className="font-medium text-lg hover:text-primary hover:underline"
                      >
                        {booking.vendor?.business_name}
                      </Link>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {booking.vendor?.business_type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>Location: {booking.vendor?.city || 'Not specified'}</p>
                      {booking.vendor?.phone && <p>Phone: {booking.vendor.phone}</p>}
                      {booking.notes && <p className="italic">"{booking.notes}"</p>}
                      <p className="text-xs">Booked: {new Date(booking.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold text-primary">
                      Rs.{(booking.amount_inr / 100).toLocaleString('en-IN')}
                    </p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={isPending}
                          className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isPending}
                          className="text-xs px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Tracking */}
                {booking.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Payment Status:</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            booking.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : booking.payment_status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.payment_status === 'paid' ? 'Fully Paid' :
                             booking.payment_status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Paid: </span>
                          <span className="font-medium text-green-600">Rs.{((booking.advance_paid_inr || 0) / 100).toLocaleString('en-IN')}</span>
                          <span className="text-muted-foreground"> / Rs.{(booking.amount_inr / 100).toLocaleString('en-IN')}</span>
                        </div>
                        {booking.payment_status !== 'paid' && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Remaining: </span>
                            <span className="font-medium text-amber-600">
                              Rs.{((booking.amount_inr - (booking.advance_paid_inr || 0)) / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                      {booking.payment_status !== 'paid' && (
                        <button
                          onClick={() => handleRecordPayment(booking)}
                          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                    {/* Payment Progress Bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(100, ((booking.advance_paid_inr || 0) / booking.amount_inr) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(((booking.advance_paid_inr || 0) / booking.amount_inr) * 100)}% paid
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Quotes */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Quote Requests</h3>
        {pendingQuotes.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="No pending quote requests"
            description="Quote requests will appear here when you request quotes from vendors"
          />
        ) : (
          <div className="space-y-4">
            {pendingQuotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/vendors/${quote.vendor_id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {quote.vendor?.business_name}
                      </Link>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        {quote.vendor?.business_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Location: {quote.vendor?.city || 'Not specified'} | Requested {new Date(quote.created_at).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">Service: </span>
                      {quote.service_type}
                    </p>
                    {quote.message && (
                      <p className="text-sm mt-2 text-gray-700 italic">"{quote.message}"</p>
                    )}

                    {/* Vendor Response */}
                    {quote.status === 'quoted' && quote.vendor_response && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900">Vendor Response:</p>
                        <p className="text-sm text-blue-800 mt-1">{quote.vendor_response}</p>
                        {quote.quoted_price_inr && (
                          <p className="text-lg font-bold text-blue-900 mt-2">
                            Quoted: Rs.{(quote.quoted_price_inr / 100).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      quote.status === 'quoted'
                        ? 'bg-blue-100 text-blue-800'
                        : quote.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : quote.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status === 'quoted' ? 'Quote Received' :
                       quote.status === 'pending' ? 'Waiting for Response' :
                       quote.status === 'accepted' ? 'Booked' : quote.status}
                    </span>

                    {quote.status === 'quoted' && (
                      <button
                        onClick={() => handleBookFromQuote(quote)}
                        className="mt-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Book This Vendor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vendor Categories */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Find Vendors by Category</h3>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Link
            href="/vendors?type=photographer"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">camera</div>
            <h4 className="font-medium">Photographers</h4>
          </Link>
          <Link
            href="/vendors?type=caterer"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">utensils</div>
            <h4 className="font-medium">Caterers</h4>
          </Link>
          <Link
            href="/vendors?type=decorator"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">palette</div>
            <h4 className="font-medium">Decorators</h4>
          </Link>
          <Link
            href="/vendors?type=entertainment"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">music</div>
            <h4 className="font-medium">Entertainment</h4>
          </Link>
          <Link
            href="/vendors?type=venue"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">building</div>
            <h4 className="font-medium">Venues</h4>
          </Link>
          <Link
            href="/vendors?type=florist"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">flower</div>
            <h4 className="font-medium">Florists</h4>
          </Link>
          <Link
            href="/vendors?type=makeup_artist"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">sparkles</div>
            <h4 className="font-medium">Makeup Artists</h4>
          </Link>
          <Link
            href="/vendors"
            className="rounded-md border p-4 text-center hover:bg-muted block bg-primary/5"
          >
            <div className="text-3xl mb-2">search</div>
            <h4 className="font-medium">View All</h4>
          </Link>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Vendor Management Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>- Request quotes from multiple vendors to compare pricing and services</li>
          <li>- Confirm vendor availability for your event date before booking</li>
          <li>- Keep track of payment schedules and advance payments</li>
          <li>- Review vendor contracts carefully before signing</li>
          <li>- Maintain regular communication with booked vendors</li>
        </ul>
      </div>
        </>
      )}

      {/* Book Vendor Modal */}
      <BookVendorModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ ...bookingModal, isOpen: false })}
        eventId={eventId}
        vendorId={bookingModal.vendorId}
        vendorName={bookingModal.vendorName}
        quoteRequestId={bookingModal.quoteRequestId}
        quotedPrice={bookingModal.quotedPrice}
        eventDate={eventDate}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        bookingId={paymentModal.bookingId}
        vendorName={paymentModal.vendorName}
        totalAmount={paymentModal.totalAmount}
        paidAmount={paymentModal.paidAmount}
      />
    </div>
  );
}
