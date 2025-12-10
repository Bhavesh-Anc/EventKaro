import { getEvent } from '@/actions/events';
import { addGuest, getEventGuestGroups } from '@/actions/guests';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewGuestPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  const groups = await getEventGuestGroups(eventId);

  if (!event) {
    redirect('/events');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href={`/events/${eventId}/guests`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Guest List
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add Guest</h2>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <form className="space-y-6">
        <input type="hidden" name="event_id" value={eventId} />

        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Guest Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="john.doe@example.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional. Used for sending RSVP invitations
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+91 98765 43210"
            />
          </div>

          {groups.length > 0 && (
            <div>
              <label
                htmlFor="guest_group_id"
                className="block text-sm font-medium mb-2"
              >
                Guest Group
              </label>
              <select
                id="guest_group_id"
                name="guest_group_id"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Group guests by family, friends, colleagues, etc.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="plus_one_allowed"
              name="plus_one_allowed"
              type="checkbox"
              className="rounded border focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="plus_one_allowed" className="text-sm font-medium">
              Allow Plus One
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            formAction={addGuest}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Guest
          </button>
          <Link
            href={`/events/${eventId}/guests`}
            className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>

      {groups.length === 0 && (
        <div className="rounded-lg border p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">💡 Tip: Create Guest Groups</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Organize your guests into groups (families, friends, colleagues) for better
            management.
          </p>
          <Link
            href={`/events/${eventId}/guests/groups/new`}
            className="text-sm text-primary hover:underline"
          >
            Create a group →
          </Link>
        </div>
      )}
    </div>
  );
}
