import { getEvent } from '@/actions/events';
import { getEventGuests, getGuestStats } from '@/actions/guests';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const guests = await getEventGuests(eventId);
  const stats = await getGuestStats(eventId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Guest List</h2>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/events/${eventId}/guests/new`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add Guest
            </Link>
            <Link
              href={`/events/${eventId}/guests/import`}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Import CSV
            </Link>
            <a
              href={`/api/guests/export?eventId=${eventId}`}
              download
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Guests</h3>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Attending</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">{stats.attending}</p>
        </div>
        <div className="rounded-lg border p-6 bg-red-50">
          <h3 className="text-sm font-medium text-red-700">Not Attending</h3>
          <p className="mt-2 text-3xl font-bold text-red-700">{stats.notAttending}</p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Plus Ones</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            +{stats.plusOnesAttending || 0}
          </p>
        </div>
      </div>

      {/* Expected Attendance */}
      <div className="rounded-lg border p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Expected Attendance
            </h3>
            <p className="mt-2 text-4xl font-bold">{stats.totalExpected}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.attending} guests + {stats.plusOnesAttending} plus ones
            </p>
          </div>
          {event.capacity && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="text-2xl font-semibold">{event.capacity}</p>
              <p className="text-sm text-muted-foreground">
                {((stats.totalExpected / event.capacity) * 100).toFixed(1)}% filled
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Guest List */}
      {guests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No guests yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding guests to your event
          </p>
          <Link
            href={`/events/${eventId}/guests/new`}
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add First Guest
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Group</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">RSVP</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Plus One</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Dietary</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {guest.first_name} {guest.last_name}
                        </p>
                        {guest.plus_one_name && (
                          <p className="text-sm text-muted-foreground">
                            +{guest.plus_one_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {guest.email && <p>{guest.email}</p>}
                        {guest.phone && (
                          <p className="text-muted-foreground">{guest.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {guest.guest_group?.name && (
                        <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {guest.guest_group.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          guest.rsvp_status === 'attending'
                            ? 'bg-green-100 text-green-800'
                            : guest.rsvp_status === 'not_attending'
                            ? 'bg-red-100 text-red-800'
                            : guest.rsvp_status === 'maybe'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {guest.rsvp_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {guest.plus_one_allowed ? (
                        <span
                          className={`${
                            guest.plus_one_rsvp === 'attending'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {guest.plus_one_rsvp === 'attending' ? '✓ Yes' : 'Allowed'}
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {guest.dietary_preferences && guest.dietary_preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {guest.dietary_preferences.map((pref: any) => (
                            <span
                              key={pref.preference}
                              className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800"
                            >
                              {pref.preference.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/events/${eventId}/guests/${guest.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
