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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label htmlFor="whatsapp_number" className="block text-sm font-medium mb-2">
                WhatsApp Number
              </label>
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if same as phone
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium mb-2">
                Relationship
              </label>
              <select
                id="relationship"
                name="relationship"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select relationship</option>
                <optgroup label="Bride's Side">
                  <option value="bride_family">Bride's Family</option>
                  <option value="bride_relative">Bride's Relative</option>
                  <option value="bride_friend">Bride's Friend</option>
                </optgroup>
                <optgroup label="Groom's Side">
                  <option value="groom_family">Groom's Family</option>
                  <option value="groom_relative">Groom's Relative</option>
                  <option value="groom_friend">Groom's Friend</option>
                </optgroup>
                <optgroup label="Common">
                  <option value="mutual_friend">Mutual Friend</option>
                  <option value="colleague">Colleague</option>
                  <option value="neighbor">Neighbor</option>
                  <option value="vip">VIP Guest</option>
                  <option value="other">Other</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="relationship_detail" className="block text-sm font-medium mb-2">
                Relationship Detail
              </label>
              <input
                id="relationship_detail"
                name="relationship_detail"
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Mama's son, College roommate"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="age_group" className="block text-sm font-medium mb-2">
                Age Group
              </label>
              <select
                id="age_group"
                name="age_group"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select age group</option>
                <option value="child">Child (0-12)</option>
                <option value="teen">Teen (13-19)</option>
                <option value="adult">Adult (20-59)</option>
                <option value="senior">Senior (60+)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Helps with catering planning
              </p>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue="standard"
              >
                <option value="vip">VIP - Must attend</option>
                <option value="high">High Priority</option>
                <option value="standard">Standard</option>
                <option value="optional">Optional</option>
              </select>
            </div>
            <div>
              <label htmlFor="preferred_contact" className="block text-sm font-medium mb-2">
                Preferred Contact
              </label>
              <select
                id="preferred_contact"
                name="preferred_contact"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue="whatsapp"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
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

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any special requirements or notes..."
            />
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
