import { getEvent, updateEventStatus } from '@/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Event Settings</h2>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      {/* Event details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Title</dt>
            <dd className="font-medium text-gray-900">{event.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Type</dt>
            <dd className="font-medium text-gray-900 capitalize">{event.event_type}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Status</dt>
            <dd className="font-medium text-gray-900 capitalize">{event.status}</dd>
          </div>
        </dl>
      </div>

      {/* Status controls */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Status</h3>
        <div className="flex flex-wrap gap-2">
          <form>
            <button
              formAction={async () => {
                'use server';
                await updateEventStatus(eventId, 'published');
              }}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Publish
            </button>
          </form>
          <form>
            <button
              formAction={async () => {
                'use server';
                await updateEventStatus(eventId, 'paused');
              }}
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Pause
            </button>
          </form>
          <form>
            <button
              formAction={async () => {
                'use server';
                await updateEventStatus(eventId, 'draft');
              }}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Move to Draft
            </button>
          </form>
        </div>
      </div>

      {/* Related settings */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Related</h3>
        <Link
          href="/budget/settings"
          className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-800 font-medium text-sm"
        >
          Budget &amp; cost settings →
        </Link>
      </div>
    </div>
  );
}
