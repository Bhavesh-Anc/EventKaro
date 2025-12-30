import { getEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { WeddingEventCreateForm } from '@/components/features/wedding-event-create-form';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function NewWeddingEventPage({ params }: Props) {
  const { eventId } = await params;
  const parentEvent = await getEvent(eventId);

  if (!parentEvent) {
    redirect('/events');
  }

  if (parentEvent.event_type !== 'wedding') {
    redirect(`/events/${eventId}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent mb-2">
          Add New Sub-Event
        </h1>
        <p className="text-gray-600">
          Create a custom event for your wedding timeline (e.g., Tilak, Chooda, Griha Pravesh, Pool Party)
        </p>
      </div>

      <WeddingEventCreateForm parentEventId={eventId} weddingDate={parentEvent.start_date} />
    </div>
  );
}
