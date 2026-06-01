import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface TimelineEvent {
  id: string;
  event_name: string;
  custom_event_name?: string;
  start_datetime: string;
  end_datetime?: string;
  venue_name?: string;
  venue_address?: string;
  expected_guest_count?: number;
  dress_code?: string;
  description?: string;
}

export default async function PublicTimelinePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Get event by share token (stored in event metadata or a separate table)
  // For now, we'll use the event slug as the token
  const { data: event } = await supabase
    .from('events')
    .select('id, title, start_date, end_date, venue_name, venue_city')
    .eq('slug', token)
    .single();

  if (!event) {
    notFound();
  }

  // Get wedding sub-events
  const { data: subEvents } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('parent_event_id', event.id)
    .order('start_datetime', { ascending: true });

  const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return {
      date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const eventNameDisplay = (e: TimelineEvent) => e.custom_event_name || e.event_name?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          {event.start_date && (
            <p className="text-rose-200 text-lg">
              {new Date(event.start_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          )}
          {event.venue_city && (
            <p className="text-rose-200 flex items-center justify-center gap-2 mt-2">
              <MapPin className="h-4 w-4" />
              {event.venue_name ? `${event.venue_name}, ` : ''}{event.venue_city}
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Event Schedule</h2>

        {!subEvents || subEvents.length === 0 ? (
          <p className="text-center text-gray-500">Schedule details coming soon...</p>
        ) : (
          <div className="space-y-6">
            {subEvents.map((evt: TimelineEvent, index: number) => {
              const { date, time } = formatDateTime(evt.start_datetime);
              const showDate = index === 0 ||
                new Date(evt.start_datetime).toDateString() !==
                new Date(subEvents[index - 1].start_datetime).toDateString();

              return (
                <div key={evt.id}>
                  {showDate && (
                    <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
                      <div className="h-px flex-1 bg-rose-200" />
                      <span className="text-rose-700 font-semibold text-sm">{date}</span>
                      <div className="h-px flex-1 bg-rose-200" />
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="bg-rose-100 text-rose-700 rounded-lg px-3 py-2 text-center min-w-[70px]">
                        <div className="text-lg font-bold">{time}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{eventNameDisplay(evt)}</h3>
                        {evt.description && (
                          <p className="text-gray-600 mt-1">{evt.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                          {evt.venue_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {evt.venue_name}
                            </span>
                          )}
                          {evt.expected_guest_count && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              ~{evt.expected_guest_count} guests
                            </span>
                          )}
                          {evt.dress_code && (
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              {evt.dress_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center text-gray-400 text-sm">
          Powered by EventKaro
        </div>
      </div>
    </div>
  );
}
