import { getUserOrganizations } from '@/actions/organizations';
import { getOrganizationEvents } from '@/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

export default async function EventsPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const events = await getOrganizationEvents(currentOrg.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage all events for {currentOrg.name}
          </p>
        </div>
        <Link
          href="/events/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first event
          </p>
          <Link
            href="/events/new"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    event.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📅</span>
                  <span>
                    {new Date(event.start_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {event.venue_city && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📍</span>
                    <span>{event.venue_city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">🎫</span>
                  <span>{event.is_free ? 'Free Event' : 'Paid Event'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
