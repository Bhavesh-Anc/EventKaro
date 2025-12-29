'use client';

import { useState } from 'react';
import { WeddingEvent } from '@/actions/wedding-events';
import { WeddingEventCard } from './wedding-event-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  eventId: string;
  weddingEvents: WeddingEvent[];
  parentEvent: any;
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

const EVENT_LABELS: Record<string, string> = {
  engagement: 'Engagement',
  mehendi: 'Mehendi',
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  wedding: 'Wedding Ceremony',
  reception: 'Reception',
  custom: 'Custom Event',
};

export function WeddingTimeline({ eventId, weddingEvents, parentEvent }: Props) {
  if (weddingEvents.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <div className="text-6xl mb-4">💒</div>
        <h3 className="text-xl font-semibold mb-2">No Wedding Events Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create default wedding events or add custom events to build your timeline
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={`/events/${eventId}/wedding-timeline/new`}>
            <Button variant="outline">+ Add Custom Event</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4 bg-rose-50">
          <h3 className="text-sm font-medium text-rose-700">Total Sub-Events</h3>
          <p className="mt-2 text-3xl font-bold text-rose-900">{weddingEvents.length}</p>
        </div>
        <div className="rounded-lg border p-4 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Confirmed</h3>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {weddingEvents.filter(e => e.status === 'confirmed').length}
          </p>
        </div>
        <div className="rounded-lg border p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Expected Guests</h3>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {weddingEvents.reduce((sum, e) => sum + (e.expected_guest_count || 0), 0)}
          </p>
        </div>
        <div className="rounded-lg border p-4 bg-orange-50">
          <h3 className="text-sm font-medium text-orange-700">Total Duration</h3>
          <p className="mt-2 text-3xl font-bold text-orange-900">
            {Math.round(weddingEvents.reduce((sum, e) => sum + e.duration_minutes, 0) / 60)}h
          </p>
        </div>
      </div>

      {/* Add New Event Button */}
      <div className="flex justify-end">
        <Link href={`/events/${eventId}/wedding-timeline/new`}>
          <Button className="bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950">
            + Add Sub-Event
          </Button>
        </Link>
      </div>

      {/* Timeline View */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-rose-200" />

        <div className="space-y-8">
          {weddingEvents.map((event, index) => (
            <div key={event.id} className="relative pl-20">
              {/* Timeline dot and icon */}
              <div className="absolute left-0 flex items-center">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-rose-700 to-rose-900 flex items-center justify-center text-3xl shadow-lg">
                  {EVENT_ICONS[event.event_name] || '✨'}
                </div>
              </div>

              {/* Event Card */}
              <WeddingEventCard
                event={event}
                eventId={eventId}
                label={event.custom_event_name || EVENT_LABELS[event.event_name]}
                isFirst={index === 0}
                isLast={index === weddingEvents.length - 1}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on any event to edit venue, timing, and guest assignments</li>
          <li>• Timeline automatically detects overlapping events and vendor conflicts</li>
          <li>• Assign specific guests to each sub-event for better management</li>
          <li>• Track vendor deliverables separately for each ceremony</li>
        </ul>
      </div>
    </div>
  );
}
