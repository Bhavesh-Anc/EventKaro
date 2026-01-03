import { getEvent } from '@/actions/events';
import { getEventRunsheet } from '@/actions/runsheet';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RunsheetClient } from './runsheet-client';

export default async function RunsheetPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const items = await getEventRunsheet(eventId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
      </div>

      <RunsheetClient
        eventId={eventId}
        eventDate={event.start_date}
        eventName={event.title}
        initialItems={items}
      />
    </div>
  );
}
