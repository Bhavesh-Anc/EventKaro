import { getEvent } from '@/actions/events';
import { getWeddingEvents, getWeddingEventConflicts } from '@/actions/wedding-events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { WeddingTimeline } from '@/components/features/wedding-timeline';
import { CreateDefaultEventsButton } from '@/components/features/create-default-events-button';

export default async function WeddingTimelinePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  if (event.event_type !== 'wedding') {
    redirect(`/events/${eventId}`);
  }

  const weddingEvents = await getWeddingEvents(eventId);
  const conflicts = await getWeddingEventConflicts(eventId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/events/${eventId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Event
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Wedding Timeline</h2>
          <p className="text-muted-foreground">
            {event.title} • {weddingEvents.length} sub-events
          </p>
        </div>
        {weddingEvents.length === 0 && (
          <CreateDefaultEventsButton
            eventId={eventId}
            weddingDate={event.start_date}
          />
        )}
      </div>

      {conflicts.eventConflicts.length > 0 || conflicts.vendorConflicts.length > 0 ? (
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Conflicts Detected</h3>
          {conflicts.eventConflicts.length > 0 && (
            <p className="text-sm text-red-800">
              {conflicts.eventConflicts.length} overlapping event time(s)
            </p>
          )}
          {conflicts.vendorConflicts.length > 0 && (
            <p className="text-sm text-red-800">
              {conflicts.vendorConflicts.length} vendor double-booking(s)
            </p>
          )}
        </div>
      ) : null}

      <WeddingTimeline
        eventId={eventId}
        weddingEvents={weddingEvents}
        parentEvent={event}
      />
    </div>
  );
}
