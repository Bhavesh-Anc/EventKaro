import { getEvent } from '@/actions/events';
import {
  getEventInvitations,
  getInvitationStats,
  createInvitationsForAllGuests,
  sendInvitationEmail,
  sendInvitationWhatsApp,
  bulkSendInvitations,
} from '@/actions/invitations';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InvitationsClient } from './invitations-client';

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const [invitations, stats] = await Promise.all([
    getEventInvitations(eventId),
    getInvitationStats(eventId),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
      </div>

      <InvitationsClient
        eventId={eventId}
        eventName={event.title}
        invitations={invitations}
        stats={stats}
      />
    </div>
  );
}
