import { getEvent } from '@/actions/events';
import { getEventVendorBookings, getEventPendingQuotes, getEventVendorStats } from '@/actions/vendors';
import { getEventPaymentInstallments } from '@/actions/payments';
import { redirect } from 'next/navigation';
import { EventVendorsClient } from '@/components/features/event-vendors-client';
import { PaymentInstallmentsSection } from './payment-installments-section';

export default async function EventVendorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  // Fetch real vendor data
  const [vendorBookings, pendingQuotes, stats, vendorPayments] = await Promise.all([
    getEventVendorBookings(eventId),
    getEventPendingQuotes(eventId),
    getEventVendorStats(eventId),
    getEventPaymentInstallments(eventId),
  ]);

  return (
    <div className="space-y-8">
      <EventVendorsClient
        eventId={eventId}
        eventTitle={event.title}
        eventDate={event.start_date}
        vendorBookings={vendorBookings}
        pendingQuotes={pendingQuotes}
        stats={stats}
      />

      {/* Payment Installments Section */}
      {vendorPayments.length > 0 && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
          <PaymentInstallmentsSection
            eventId={eventId}
            vendorPayments={vendorPayments}
          />
        </div>
      )}
    </div>
  );
}
