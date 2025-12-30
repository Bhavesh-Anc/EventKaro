import { getEvent } from '@/actions/events';
import { getWeddingEvents } from '@/actions/wedding-events';
import { redirect } from 'next/navigation';
import { WeddingEventEditForm } from '@/components/features/wedding-event-edit-form';

interface Props {
  params: Promise<{ eventId: string; subEventId: string }>;
}

export default async function EditWeddingEventPage({ params }: Props) {
  const { eventId, subEventId } = await params;
  const parentEvent = await getEvent(eventId);

  if (!parentEvent) {
    redirect('/events');
  }

  if (parentEvent.event_type !== 'wedding') {
    redirect(`/events/${eventId}`);
  }

  const weddingEvents = await getWeddingEvents(eventId);
  const event = weddingEvents.find((e) => e.id === subEventId);

  if (!event) {
    redirect(`/events/${eventId}/wedding-timeline`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent mb-2">
          Edit Event: {event.custom_event_name || event.event_name}
        </h1>
        <p className="text-gray-600">
          Update details, timing, venue, and guest information for this event
        </p>
      </div>

      <WeddingEventEditForm event={event} parentEventId={eventId} />
    </div>
  );
}
