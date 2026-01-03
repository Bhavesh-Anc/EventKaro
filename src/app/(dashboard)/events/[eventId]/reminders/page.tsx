import { getEvent } from '@/actions/events';
import {
  getEventReminders,
  getUpcomingReminders,
  getReminderStats,
} from '@/actions/reminders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RemindersClient } from './reminders-client';

export default async function RemindersPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const [reminders, upcomingReminders, stats] = await Promise.all([
    getEventReminders(eventId),
    getUpcomingReminders(eventId),
    getReminderStats(eventId),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
      </div>

      <RemindersClient
        eventId={eventId}
        eventName={event.title}
        eventDate={event.start_date}
        reminders={reminders}
        upcomingReminders={upcomingReminders}
        stats={stats}
      />
    </div>
  );
}
