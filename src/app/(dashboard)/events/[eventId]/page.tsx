import { getEvent, updateEventStatus } from '@/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EventDetailPage({
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Events
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
          <p className="text-muted-foreground">{event.slug}</p>
        </div>
        <div className="flex gap-2">
          {event.status === 'draft' && (
            <form>
              <input type="hidden" name="status" value="published" />
              <button
                formAction={async () => {
                  'use server';
                  await updateEventStatus(eventId, 'published');
                }}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Publish Event
              </button>
            </form>
          )}
          {event.status === 'published' && (
            <form>
              <button
                formAction={async () => {
                  'use server';
                  await updateEventStatus(eventId, 'paused');
                }}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
              >
                Pause Event
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="mt-2 text-2xl font-bold capitalize">{event.status}</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Event Type</h3>
          <p className="mt-2 text-2xl font-bold capitalize">{event.event_type}</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
          <p className="mt-2 text-2xl font-bold">
            {event.capacity ? event.capacity.toLocaleString() : 'Unlimited'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Event Details</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="mt-1">{event.description}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Start Date</dt>
              <dd className="mt-1">
                {new Date(event.start_date).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">End Date</dt>
              <dd className="mt-1">
                {new Date(event.end_date).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pricing</dt>
              <dd className="mt-1">{event.is_free ? 'Free Event' : 'Paid Event'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Venue Type</dt>
              <dd className="mt-1 capitalize">{event.venue_type}</dd>
            </div>
            {event.venue_name && (
              <div>
                <dt className="text-muted-foreground">Venue Name</dt>
                <dd className="mt-1">{event.venue_name}</dd>
              </div>
            )}
            {event.venue_city && (
              <div>
                <dt className="text-muted-foreground">City</dt>
                <dd className="mt-1">{event.venue_city}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-5">
          <Link
            href={`/events/${eventId}/tickets`}
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">🎫</div>
            <h4 className="font-medium">Manage Tickets</h4>
          </Link>
          <Link
            href={`/events/${eventId}/guests`}
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-medium">Guest List</h4>
          </Link>
          <Link
            href={`/events/${eventId}/accommodations`}
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">🏨</div>
            <h4 className="font-medium">Accommodations</h4>
          </Link>
          <Link
            href={`/events/${eventId}/analytics`}
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium">Analytics</h4>
          </Link>
          <Link
            href={`/events/${eventId}/settings`}
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h4 className="font-medium">Settings</h4>
          </Link>
        </div>
      </div>
    </div>
  );
}
