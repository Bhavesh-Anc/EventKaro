import { getEvent } from '@/actions/events';
import { getSeatingTables, getGuestsWithSeating } from '@/actions/seating';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SeatingClient } from './seating-client';

export default async function SeatingPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const [tables, guests] = await Promise.all([
    getSeatingTables(eventId),
    getGuestsWithSeating(eventId),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seating Arrangement</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
      </div>

      <SeatingClient
        eventId={eventId}
        initialTables={tables}
        initialGuests={guests}
      />
    </div>
  );
}
