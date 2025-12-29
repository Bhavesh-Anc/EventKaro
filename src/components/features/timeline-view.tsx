'use client';

import { useState } from 'react';
import { format, parseISO, isSameDay, isToday } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateEventStatus,
  getEventDisplayName,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  type WeddingEventData,
} from '@/lib/wedding-status';
import { EventDetailPanel } from './event-detail-panel';

interface Props {
  events: WeddingEventData[];
  parentEventId: string;
  weddingDate: string;
}

/**
 * TIMELINE VIEW - Main Canvas
 *
 * Vertical timeline showing all wedding sub-events in chronological order
 * Grouped by date, with status indicators and click-to-expand detail panels
 */
export function TimelineView({ events, parentEventId, weddingDate }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [weddingDayMode, setWeddingDayMode] = useState(false);

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = format(parseISO(event.start_datetime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, WeddingEventData[]>);

  const dates = Object.keys(eventsByDate).sort();

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border-2 border-rose-200 bg-white p-12 shadow-sm text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No events in your timeline yet
        </h3>
        <p className="text-gray-600 mb-6">
          Set up your wedding events to avoid last-minute chaos
        </p>
        <Link
          href={`/events/${parentEventId}/setup-timeline`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/events/${parentEventId}/setup-timeline`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 font-semibold transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Link>
        </div>

        <button
          onClick={() => setWeddingDayMode(!weddingDayMode)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            weddingDayMode
              ? 'bg-rose-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {weddingDayMode ? '📱 Wedding Day Mode' : 'Planning Mode'}
        </button>
      </div>

      {/* Timeline Container */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Timeline */}
        <div className="space-y-8">
          {dates.map((date) => {
            const dateObj = parseISO(date);
            const dayEvents = eventsByDate[date];
            const isTodayDate = isToday(dateObj);

            return (
              <div key={date} className="relative">
                {/* Date Header */}
                <div
                  className={`sticky top-0 z-10 flex items-center gap-3 mb-4 pb-2 border-b-2 ${
                    isTodayDate
                      ? 'bg-rose-50 border-rose-400'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      isTodayDate
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {format(dateObj, 'd')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {format(dateObj, 'EEEE, MMMM d, yyyy')}
                    </div>
                    {isTodayDate && (
                      <div className="text-sm text-rose-700 font-semibold">
                        Today
                      </div>
                    )}
                  </div>
                </div>

                {/* Events for this date */}
                <div className="space-y-4 pl-2">
                  {dayEvents.map((event) => {
                    const statusDetails = calculateEventStatus(event, events);
                    const eventName = getEventDisplayName(event);
                    const startDate = parseISO(event.start_datetime);
                    const endDate = parseISO(event.end_datetime);
                    const isSelected = selectedEventId === event.id;

                    return (
                      <button
                        key={event.id}
                        onClick={() =>
                          setSelectedEventId(
                            isSelected ? null : event.id
                          )
                        }
                        className={`w-full text-left relative rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-rose-300'
                        }`}
                      >
                        {/* Status Strip */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${getStatusColor(
                            statusDetails.status
                          )}`}
                        />

                        <div className="ml-4">
                          {/* Event Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {eventName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="h-4 w-4" />
                                <span className="font-semibold">
                                  {format(startDate, 'h:mm a')} –{' '}
                                  {format(endDate, 'h:mm a')}
                                </span>
                                <span className="text-gray-500">
                                  ({event.duration_minutes || 0} min)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusBadge status={statusDetails.status} />
                              <ChevronRight
                                className={`h-5 w-5 text-gray-400 transition-transform ${
                                  isSelected ? 'rotate-90' : ''
                                }`}
                              />
                            </div>
                          </div>

                          {/* Event Quick Info */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="truncate">
                                {event.venue_name || 'Venue TBD'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>
                                {event.expected_guest_count || 0} guests
                              </span>
                            </div>
                          </div>

                          {/* Status Issues (if any) */}
                          {statusDetails.status !== 'ready' &&
                            !isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                {statusDetails.conflicts.length > 0 && (
                                  <div className="flex items-start gap-2 text-sm text-red-700 mb-1">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {statusDetails.conflicts[0]}
                                    </span>
                                  </div>
                                )}
                                {statusDetails.issues.length > 0 &&
                                  statusDetails.conflicts.length === 0 && (
                                    <div className="flex items-start gap-2 text-sm text-amber-700">
                                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                      <span>{statusDetails.issues[0]}</span>
                                    </div>
                                  )}
                              </div>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Detail Panel (Right Side) */}
        {selectedEvent && (
          <div className="lg:sticky lg:top-6 h-fit">
            <EventDetailPanel
              event={selectedEvent}
              allEvents={events}
              onClose={() => setSelectedEventId(null)}
            />
          </div>
        )}
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
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${colors[status]}`}
    >
      <span>{getStatusIcon(status)}</span>
      <span className="uppercase tracking-wide">{getStatusLabel(status)}</span>
    </div>
  );
}
