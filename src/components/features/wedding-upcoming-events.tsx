'use client';

import { format } from 'date-fns';
import { MapPin, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  venue: string;
  date: Date;
  time: string;
  expectedGuests: number;
  confirmed: number;
  eventType: string;
}

interface Props {
  events: Event[];
  parentEventId?: string;
}

const EVENT_ICONS: Record<string, string> = {
  engagement: '💍',
  mehendi: '🎨',
  haldi: '🌼',
  sangeet: '🎵',
  wedding: '👰',
  reception: '🎉',
  custom: '✨',
};

export function WeddingUpcomingEvents({ events, parentEventId }: Props) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        {parentEventId && (
          <Link
            href={`/events/${parentEventId}/wedding-timeline`}
            className="text-sm font-medium text-rose-700 hover:text-rose-800"
          >
            View All →
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={parentEventId ? `/events/${parentEventId}/wedding-timeline/${event.id}` : `/events/${event.id}`}
              className="block rounded-lg border border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-3xl">{EVENT_ICONS[event.eventType] || '✨'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                    <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {event.confirmed}/{event.expectedGuests} Confirmed
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(event.date, 'MMM d')} • {event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
