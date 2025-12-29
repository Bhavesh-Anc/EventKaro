import Link from 'next/link';
import { Calendar, MapPin, Users, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import {
  calculateEventStatus,
  getEventDisplayName,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  type WeddingEventData,
} from '@/lib/wedding-status';

interface Props {
  events: WeddingEventData[];
  parentEventId: string;
}

/**
 * DASHBOARD TIMELINE WIDGET
 *
 * Purpose: Show next 3 events with status at a glance
 * Non-negotiable: Must answer "What's happening next, are we in trouble?" in under 10 seconds
 */
export function DashboardWeddingTimeline({ events, parentEventId }: Props) {
  // Sort by start time and take next 3
  const upcomingEvents = events
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 3);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Wedding Timeline</h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Set up your wedding events to avoid last-minute chaos</p>
          <Link
            href={`/events/${parentEventId}/setup-timeline`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all"
          >
            Add Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Wedding Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">Next 72 hours</p>
        </div>
        <Link
          href="/timeline"
          className="text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors"
        >
          View full timeline →
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const statusDetails = calculateEventStatus(event, events);
          const eventName = getEventDisplayName(event);
          const startDate = parseISO(event.start_datetime);
          const endDate = parseISO(event.end_datetime);
          const isTodayEvent = isToday(startDate);

          return (
            <Link
              key={event.id}
              href={`/timeline?event=${event.id}`}
              className="block group"
            >
              <div
                className={`relative rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  isTodayEvent
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 bg-white hover:border-rose-300'
                }`}
              >
                {/* Status Strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${getStatusColor(
                    statusDetails.status
                  )}`}
                />

                <div className="ml-3">
                  {/* Event Name */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{eventName}</h3>
                    <StatusBadge status={statusDetails.status} />
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(startDate, 'd MMM')} · {format(startDate, 'h:mm a')}–
                      {format(endDate, 'h:mm a')}
                    </span>
                  </div>

                  {/* Venue */}
                  {event.venue_name && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{event.venue_name}</span>
                    </div>
                  )}

                  {/* Guest Count */}
                  {event.expected_guest_count && event.expected_guest_count > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{event.expected_guest_count} guests</span>
                    </div>
                  )}

                  {/* Status Details */}
                  {statusDetails.status !== 'ready' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {statusDetails.conflicts.length > 0 && (
                        <div className="space-y-1">
                          {statusDetails.conflicts.slice(0, 2).map((conflict, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-red-700"
                            >
                              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span>{conflict}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {statusDetails.issues.length > 0 && (
                        <div className="space-y-1">
                          {statusDetails.issues.slice(0, 2).map((issue, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-amber-700"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(statusDetails.conflicts.length > 2 || statusDetails.issues.length > 2) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Click to see all issues
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ready' | 'attention' | 'conflict' }) {
  const colors = {
    ready: 'bg-green-100 text-green-800 border-green-200',
    attention: 'bg-amber-100 text-amber-800 border-amber-200',
    conflict: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${colors[status]}`}
    >
      <span>{getStatusIcon(status)}</span>
      <span>{getStatusLabel(status)}</span>
    </div>
  );
}
