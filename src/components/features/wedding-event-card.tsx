'use client';

import { WeddingEvent } from '@/actions/wedding-events';
import Link from 'next/link';
import { format, formatDistance } from 'date-fns';

interface Props {
  event: WeddingEvent;
  eventId: string;
  label: string;
  isFirst: boolean;
  isLast: boolean;
}

const STATUS_COLORS = {
  planned: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function WeddingEventCard({ event, eventId, label, isFirst, isLast }: Props) {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  return (
    <Link href={`/events/${eventId}/wedding-timeline/${event.id}`}>
      <div className="rounded-lg border-2 border-rose-200 bg-white p-6 hover:shadow-lg hover:border-rose-400 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{label}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[event.status]}`}>
                {event.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {format(startDate, 'EEEE, MMMM d, yyyy')} • {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </p>
            <p className="text-xs text-gray-500">Duration: {event.duration_minutes} minutes</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {event.venue_name && (
            <div>
              <p className="text-gray-500">Venue</p>
              <p className="font-medium text-gray-900">{event.venue_name}</p>
              {event.venue_city && (
                <p className="text-xs text-gray-500">{event.venue_city}</p>
              )}
            </div>
          )}

          {event.expected_guest_count !== null && (
            <div>
              <p className="text-gray-500">Expected Guests</p>
              <p className="font-medium text-gray-900">{event.expected_guest_count}</p>
            </div>
          )}

          {event.dress_code && (
            <div>
              <p className="text-gray-500">Dress Code</p>
              <p className="font-medium text-gray-900">{event.dress_code}</p>
            </div>
          )}

          {event.theme_colors && event.theme_colors.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Theme Colors</p>
              <div className="flex gap-2">
                {event.theme_colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          </div>
        )}

        {event.transportation_provided && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
            <span>🚌</span>
            <span>Transportation Provided</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t flex gap-4 text-xs text-gray-500">
          <span>Seq: #{event.sequence_order}</span>
          {!isFirst && <span>↓</span>}
          {!isLast && <span>↑</span>}
        </div>
      </div>
    </Link>
  );
}
