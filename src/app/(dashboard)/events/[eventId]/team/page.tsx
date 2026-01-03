import { getEvent } from '@/actions/events';
import { getEventTeamMembers } from '@/actions/team';
import { getUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TeamClient } from './team-client';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, user, members] = await Promise.all([
    getEvent(eventId),
    getUser(),
    getEventTeamMembers(eventId),
  ]);

  if (!event) {
    redirect('/events');
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <TeamClient
        eventId={eventId}
        eventName={event.title}
        currentUserId={user.id}
        initialMembers={members}
      />
    </div>
  );
}
