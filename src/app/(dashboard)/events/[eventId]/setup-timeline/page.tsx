import { getEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { TimelineSetupWizard } from '@/components/wedding/timeline-setup-wizard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SetupTimelinePage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/dashboard');
  }

  if (event.event_type !== 'wedding') {
    redirect(`/events/${eventId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white py-8 px-4">
      {/* Back Link */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Timeline Wizard */}
      <TimelineSetupWizard
        eventId={eventId}
        weddingDate={event.start_date}
        venueName={event.venue_name || undefined}
        venueCity={event.venue_city || undefined}
        guestCount={event.capacity || undefined}
      />
    </div>
  );
}
