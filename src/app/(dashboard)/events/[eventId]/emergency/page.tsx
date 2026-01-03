import { getEvent } from '@/actions/events';
import {
  getEventEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '@/actions/emergency-contacts';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { EmergencyContactsClient } from './emergency-client';

export default async function EmergencyContactsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const contacts = await getEventEmergencyContacts(eventId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <EmergencyContactsClient
        eventId={eventId}
        initialContacts={contacts}
        venueName={event.venue_name}
        venueAddress={event.venue_address}
      />
    </div>
  );
}
