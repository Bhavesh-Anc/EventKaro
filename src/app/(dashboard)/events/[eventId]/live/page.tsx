import { getEvent } from '@/actions/events';
import { getEventRunsheet } from '@/actions/runsheet';
import { getEventEmergencyContacts } from '@/actions/emergency-contacts';
import { redirect } from 'next/navigation';
import { LiveModeClient } from './live-client';

export default async function LiveModePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const [runsheetItems, emergencyContacts] = await Promise.all([
    getEventRunsheet(eventId),
    getEventEmergencyContacts(eventId),
  ]);

  return (
    <LiveModeClient
      eventId={eventId}
      eventName={event.title}
      eventDate={event.start_date}
      venueName={event.venue_name}
      runsheetItems={runsheetItems}
      emergencyContacts={emergencyContacts}
    />
  );
}
