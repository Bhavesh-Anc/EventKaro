import { getEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { createWeddingSubEvents } from '@/actions/wedding-timeline';
import { CustomEventsManager } from '@/components/features/custom-events-manager';

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

  const standardEvents = [
    { id: 'engagement', name: 'Engagement', description: 'Ring ceremony and celebration' },
    { id: 'mehendi', name: 'Mehendi', description: 'Henna application ceremony' },
    { id: 'haldi', name: 'Haldi', description: 'Turmeric ceremony' },
    { id: 'sangeet', name: 'Sangeet', description: 'Music and dance night' },
    { id: 'wedding', name: 'Wedding', description: 'Main wedding ceremony', defaultSelected: true },
    { id: 'reception', name: 'Reception', description: 'Wedding reception party' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent mb-2">
          Build Your Wedding Timeline
        </h1>
        <p className="text-gray-600">
          Select the events you want to include in your wedding celebration. You can customize each event later.
        </p>
      </div>

      <form className="space-y-6">
        <input type="hidden" name="parent_event_id" value={eventId} />
        <input type="hidden" name="event_date" value={event.start_date} />

        {/* Standard Events Selection */}
        <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Events</h2>
          <div className="space-y-3">
            {standardEvents.map((stdEvent) => (
              <label
                key={stdEvent.id}
                className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  name="selected_events"
                  value={stdEvent.id}
                  defaultChecked={stdEvent.defaultSelected}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{stdEvent.name}</span>
                    {stdEvent.defaultSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{stdEvent.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Events Section */}
        <CustomEventsManager />

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>We'll create your selected events with default timings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>You can customize dates, times, venues, and details for each event</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Add guests, vendors, and manage budgets per event</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Track RSVPs and manage everything from your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            formAction={createWeddingSubEvents}
            className="flex-1 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 px-6 py-3 text-base font-semibold text-white hover:from-rose-800 hover:to-rose-950 shadow-lg hover:shadow-xl transition-all"
          >
            Create Wedding Timeline
          </button>
        </div>
      </form>
    </div>
  );
}
