'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Check,
  X,
  Clock,
  HelpCircle,
  Users,
  Car,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateGuestEventRSVP, bulkUpdateGuestEventRSVPs } from '@/actions/guests';

interface WeddingEvent {
  id: string;
  event_name: string;
  custom_event_name?: string;
  start_datetime: string;
  venue_name?: string;
}

interface GuestEventRSVP {
  id: string;
  wedding_event_id: string;
  rsvp_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  rsvp_date?: string;
  plus_one_attending?: boolean;
  dietary_preference?: string;
  transportation_needed?: boolean;
  wedding_event?: WeddingEvent;
}

interface GuestEventRSVPProps {
  guestId: string;
  guestName: string;
  weddingEvents: WeddingEvent[];
  existingRSVPs: GuestEventRSVP[];
  onUpdate?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Pending',
  },
  accepted: {
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Attending',
  },
  declined: {
    icon: X,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Not Attending',
  },
  tentative: {
    icon: HelpCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Maybe',
  },
};

export function GuestEventRSVP({
  guestId,
  guestName,
  weddingEvents,
  existingRSVPs,
  onUpdate,
}: GuestEventRSVPProps) {
  const [isPending, startTransition] = useTransition();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [localRSVPs, setLocalRSVPs] = useState<Record<string, GuestEventRSVP>>(
    existingRSVPs.reduce((acc, rsvp) => {
      acc[rsvp.wedding_event_id] = rsvp;
      return acc;
    }, {} as Record<string, GuestEventRSVP>)
  );

  const handleStatusChange = async (
    eventId: string,
    status: 'pending' | 'accepted' | 'declined' | 'tentative'
  ) => {
    startTransition(async () => {
      const result = await updateGuestEventRSVP(guestId, eventId, status);
      if (result.success) {
        setLocalRSVPs(prev => ({
          ...prev,
          [eventId]: {
            ...prev[eventId],
            wedding_event_id: eventId,
            rsvp_status: status,
            rsvp_date: new Date().toISOString(),
          } as GuestEventRSVP,
        }));
        onUpdate?.();
      }
    });
  };

  const handleBulkUpdate = async (status: 'accepted' | 'declined') => {
    startTransition(async () => {
      const eventIds = weddingEvents.map(e => e.id);
      const result = await bulkUpdateGuestEventRSVPs(guestId, eventIds, status);
      if (result.success) {
        const updatedRSVPs = eventIds.reduce((acc, id) => {
          acc[id] = {
            ...localRSVPs[id],
            wedding_event_id: id,
            rsvp_status: status,
            rsvp_date: new Date().toISOString(),
          } as GuestEventRSVP;
          return acc;
        }, {} as Record<string, GuestEventRSVP>);
        setLocalRSVPs(updatedRSVPs);
        onUpdate?.();
      }
    });
  };

  const handleAdditionalDetails = async (
    eventId: string,
    details: {
      plusOneAttending?: boolean;
      dietaryPreference?: string;
      transportationNeeded?: boolean;
    }
  ) => {
    startTransition(async () => {
      const currentStatus = localRSVPs[eventId]?.rsvp_status || 'pending';
      const result = await updateGuestEventRSVP(guestId, eventId, currentStatus, details);
      if (result.success) {
        setLocalRSVPs(prev => ({
          ...prev,
          [eventId]: {
            ...prev[eventId],
            wedding_event_id: eventId,
            plus_one_attending: details.plusOneAttending,
            dietary_preference: details.dietaryPreference,
            transportation_needed: details.transportationNeeded,
          } as GuestEventRSVP,
        }));
        onUpdate?.();
      }
    });
  };

  // Calculate summary stats
  const attending = weddingEvents.filter(
    e => localRSVPs[e.id]?.rsvp_status === 'accepted'
  ).length;
  const notAttending = weddingEvents.filter(
    e => localRSVPs[e.id]?.rsvp_status === 'declined'
  ).length;
  const pending = weddingEvents.length - attending - notAttending;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Event Attendance</h3>
          <p className="text-sm text-gray-500">
            {attending} attending, {notAttending} declined, {pending} pending
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkUpdate('accepted')}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            All Attending
          </button>
          <button
            onClick={() => handleBulkUpdate('declined')}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            None
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {weddingEvents.map(event => {
          const rsvp = localRSVPs[event.id];
          const status = rsvp?.rsvp_status || 'pending';
          const config = STATUS_CONFIG[status];
          const StatusIcon = config.icon;
          const isExpanded = expandedEvent === event.id;
          const eventName = event.custom_event_name || event.event_name;

          return (
            <div
              key={event.id}
              className={cn(
                "rounded-xl border transition-all",
                config.border,
                config.bg
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900 capitalize">
                        {eventName}
                      </h4>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>
                        {format(new Date(event.start_datetime), 'EEE, d MMM yyyy')}
                      </span>
                      <span>
                        {format(new Date(event.start_datetime), 'h:mm a')}
                      </span>
                      {event.venue_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm",
                    config.bg,
                    config.color
                  )}>
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </div>
                </div>

                {/* RSVP Buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['accepted', 'declined', 'tentative'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(event.id, s)}
                      disabled={isPending}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        status === s
                          ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ring-2 ring-offset-1 ${STATUS_CONFIG[s].border.replace('border-', 'ring-')}`
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}

                  {/* Expand for additional details */}
                  {status === 'accepted' && (
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? 'Less details' : 'Add details'}
                    </button>
                  )}
                </div>

                {/* Additional Details (for accepted) */}
                {isExpanded && status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Plus One */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rsvp?.plus_one_attending || false}
                        onChange={(e) => handleAdditionalDetails(event.id, {
                          plusOneAttending: e.target.checked,
                        })}
                        className="h-4 w-4 rounded border-gray-300 text-rose-600"
                      />
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Bringing +1</span>
                    </label>

                    {/* Transportation */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rsvp?.transportation_needed || false}
                        onChange={(e) => handleAdditionalDetails(event.id, {
                          transportationNeeded: e.target.checked,
                        })}
                        className="h-4 w-4 rounded border-gray-300 text-rose-600"
                      />
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Needs transportation</span>
                    </label>

                    {/* Dietary Preference */}
                    <div className="flex items-center gap-3">
                      <Utensils className="h-4 w-4 text-gray-400" />
                      <select
                        value={rsvp?.dietary_preference || ''}
                        onChange={(e) => handleAdditionalDetails(event.id, {
                          dietaryPreference: e.target.value,
                        })}
                        className="flex-1 rounded-md border px-3 py-1.5 text-sm"
                      >
                        <option value="">No dietary restrictions</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="jain">Jain</option>
                        <option value="halal">Halal</option>
                        <option value="gluten_free">Gluten Free</option>
                        <option value="other">Other (see notes)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {weddingEvents.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
          <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No wedding events set up yet</p>
          <p className="text-sm text-gray-500">
            Add wedding events in the timeline to enable per-event RSVP
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Summary component for showing event-wise RSVP stats on dashboard
 */
interface EventRSVPSummaryProps {
  stats: {
    id: string;
    eventName: string;
    start_datetime: string;
    total: number;
    accepted: number;
    declined: number;
    pending: number;
  }[];
}

export function EventRSVPSummary({ stats }: EventRSVPSummaryProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        Attendance by Event
      </h3>

      <div className="space-y-4">
        {stats.map(event => {
          const attendancePercent = event.total > 0
            ? Math.round((event.accepted / event.total) * 100)
            : 0;

          return (
            <div key={event.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {event.eventName}
                </span>
                <span className="text-sm text-gray-500">
                  {event.accepted}/{event.total} ({attendancePercent}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(event.accepted / event.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 transition-all"
                    style={{ width: `${(event.declined / event.total) * 100}%` }}
                  />
                  <div
                    className="bg-amber-300 transition-all"
                    style={{ width: `${(event.pending / event.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {event.accepted} attending
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  {event.declined} declined
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  {event.pending} pending
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
