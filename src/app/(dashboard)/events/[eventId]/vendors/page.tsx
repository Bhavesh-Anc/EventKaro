import { getEvent } from '@/actions/events';
import { getEventVendorBookings, getEventPendingQuotes, getEventVendorStats } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { EventVendorsClient } from '@/components/features/event-vendors-client';

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
  const vendorBookings = await getEventVendorBookings(eventId);
  const pendingQuotes = await getEventPendingQuotes(eventId);
  const stats = await getEventVendorStats(eventId);

  return (
    <EventVendorsClient
      eventId={eventId}
      eventTitle={event.title}
      eventDate={event.start_date}
      vendorBookings={vendorBookings}
      pendingQuotes={pendingQuotes}
      stats={stats}
    />
  );
}
