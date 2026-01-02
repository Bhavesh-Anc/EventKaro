import { getEvent } from '@/actions/events';
import {
  getGuest,
  updateGuest,
  updateGuestRSVP,
  updatePlusOne,
  addDietaryPreference,
  removeDietaryPreference,
  toggleCheckIn,
  deleteGuest,
  getEventGuestGroups,
  getWeddingEventsForRSVP,
  getGuestEventRSVPs,
} from '@/actions/guests';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GuestInfoForm } from '@/components/features/guest-info-form';
import { GuestRSVPForm } from '@/components/features/guest-rsvp-form';
import { GuestPlusOneForm } from '@/components/features/guest-plus-one-form';
import { GuestDietaryForm } from '@/components/features/guest-dietary-form';
import { GuestEventRSVP } from '@/components/features/guest-event-rsvp';

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; guestId: string }>;
}) {
  const { eventId, guestId } = await params;
  const event = await getEvent(eventId);
  const guest = await getGuest(guestId);
  const groups = await getEventGuestGroups(eventId);

  // Fetch wedding events and per-event RSVPs for wedding events
  const weddingEvents = event?.event_type === 'wedding'
    ? await getWeddingEventsForRSVP(eventId)
    : [];
  const guestEventRSVPs = weddingEvents.length > 0
    ? await getGuestEventRSVPs(guestId)
    : [];

  if (!event || !guest) {
    redirect(`/events/${eventId}/guests`);
  }

  const handleCheckIn = async () => {
    'use server';
    await toggleCheckIn(guestId, eventId);
  };

  const handleDelete = async () => {
    'use server';
    await deleteGuest(guestId);
    redirect(`/events/${eventId}/guests`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href={`/events/${eventId}/guests`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Guest List
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {guest.first_name} {guest.last_name}
            </h2>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <div className="flex gap-2">
            <form action={handleCheckIn}>
              <button
                type="submit"
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  guest.checked_in
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'hover:bg-muted'
                }`}
              >
                {guest.checked_in ? '✓ Checked In' : 'Check In'}
              </button>
            </form>
            <form action={handleDelete}>
              <button
                type="submit"
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete Guest
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">RSVP Status</h3>
          <p className="mt-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                guest.rsvp_status === 'accepted'
                  ? 'bg-green-100 text-green-800'
                  : guest.rsvp_status === 'declined'
                  ? 'bg-red-100 text-red-800'
                  : guest.rsvp_status === 'maybe'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {guest.rsvp_status.replace('_', ' ')}
            </span>
          </p>
          {guest.rsvp_date && (
            <p className="text-xs text-muted-foreground mt-2">
              Updated: {new Date(guest.rsvp_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Plus One</h3>
          <p className="mt-2 text-sm">
            {guest.plus_one_allowed ? (
              <>
                {guest.plus_one_name ? (
                  <span className="font-medium">{guest.plus_one_name}</span>
                ) : (
                  <span className="text-muted-foreground">Allowed</span>
                )}
                {guest.plus_one_rsvp && (
                  <span
                    className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs ${
                      guest.plus_one_rsvp === 'attending'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {guest.plus_one_rsvp}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Not allowed</span>
            )}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Group</h3>
          <p className="mt-2">
            {guest.guest_group?.name ? (
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {guest.guest_group.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No group</span>
            )}
          </p>
        </div>
      </div>

      {/* Guest Information */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Guest Information</h3>
        <GuestInfoForm
          guest={guest}
          eventId={eventId}
          groups={groups}
          updateAction={updateGuest}
        />
      </div>

      {/* RSVP Management */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">RSVP Management</h3>
        <GuestRSVPForm
          guestId={guestId}
          eventId={eventId}
          currentStatus={guest.rsvp_status}
          updateAction={updateGuestRSVP}
        />
      </div>

      {/* Per-Event RSVP (Wedding Only) */}
      {weddingEvents.length > 0 && (
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Event-wise Attendance</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Track which wedding functions this guest will attend
          </p>
          <GuestEventRSVP
            guestId={guestId}
            guestName={`${guest.first_name} ${guest.last_name || ''}`}
            weddingEvents={weddingEvents}
            existingRSVPs={guestEventRSVPs}
          />
        </div>
      )}

      {/* Plus One Details */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Plus One Details</h3>
        <GuestPlusOneForm
          guest={guest}
          eventId={eventId}
          updateAction={updatePlusOne}
        />
      </div>

      {/* Dietary Preferences */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Dietary Preferences</h3>
        <GuestDietaryForm
          guestId={guestId}
          eventId={eventId}
          currentPreferences={guest.dietary_preferences || []}
          addAction={addDietaryPreference}
          removeAction={removeDietaryPreference}
        />
      </div>

      {/* Notes */}
      {guest.notes && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <p className="text-sm text-muted-foreground">{guest.notes}</p>
        </div>
      )}

      {/* Guest Details Summary */}
      {(guest.relationship || guest.age_group || guest.priority) && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Guest Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {guest.relationship && (
              <div>
                <span className="text-xs text-muted-foreground block">Relationship</span>
                <span className="font-medium capitalize">
                  {guest.relationship.replace(/_/g, ' ')}
                </span>
                {guest.relationship_detail && (
                  <span className="text-sm text-muted-foreground block">
                    {guest.relationship_detail}
                  </span>
                )}
              </div>
            )}
            {guest.age_group && (
              <div>
                <span className="text-xs text-muted-foreground block">Age Group</span>
                <span className="font-medium capitalize">{guest.age_group}</span>
              </div>
            )}
            {guest.priority && (
              <div>
                <span className="text-xs text-muted-foreground block">Priority</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  guest.priority === 'vip' ? 'bg-amber-100 text-amber-800' :
                  guest.priority === 'high' ? 'bg-blue-100 text-blue-800' :
                  guest.priority === 'optional' ? 'bg-gray-100 text-gray-600' :
                  'bg-green-100 text-green-800'
                }`}>
                  {guest.priority.toUpperCase()}
                </span>
              </div>
            )}
            {guest.preferred_contact && (
              <div>
                <span className="text-xs text-muted-foreground block">Preferred Contact</span>
                <span className="font-medium capitalize">{guest.preferred_contact}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Additional Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Added:</span>{' '}
            {new Date(guest.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="text-muted-foreground">Source:</span>{' '}
            {guest.source || 'manual'}
          </div>
          {guest.whatsapp_number && (
            <div>
              <span className="text-muted-foreground">WhatsApp:</span>{' '}
              {guest.whatsapp_number}
            </div>
          )}
          {guest.invitation_sent && (
            <div>
              <span className="text-muted-foreground">Invitation sent:</span>{' '}
              {new Date(guest.invitation_sent_at).toLocaleDateString()}
            </div>
          )}
          {guest.checked_in && (
            <div>
              <span className="text-muted-foreground">Checked in:</span>{' '}
              {new Date(guest.checked_in_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
