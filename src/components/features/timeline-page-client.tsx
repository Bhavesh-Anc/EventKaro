'use client';

import { useState } from 'react';
import { Calendar, LayoutGrid, Plus } from 'lucide-react';
import Link from 'next/link';
import { TimelineView } from './timeline-view';
import { UnifiedTimeline, type TimelineTask, type TimelineVendorBooking, type TimelineEvent as UnifiedTimelineEvent } from './unified-timeline';
import type { WeddingEventData } from '@/lib/wedding-status';

interface Props {
  timelineEvents: WeddingEventData[];
  unifiedEvents: UnifiedTimelineEvent[];
  unifiedTasks: TimelineTask[];
  unifiedVendorBookings: TimelineVendorBooking[];
  parentEventId: string;
  weddingDate: string;
}

type ViewMode = 'unified' | 'events-only';

export function TimelinePageClient({
  timelineEvents,
  unifiedEvents,
  unifiedTasks,
  unifiedVendorBookings,
  parentEventId,
  weddingDate,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('unified');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events & Timeline</h1>
          <p className="text-gray-600 mt-1">
            Manage all your wedding events, tasks, and vendor payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/events/${parentEventId}/setup-timeline`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('unified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'unified'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">All Items</span>
          <span className="sm:hidden">All</span>
        </button>
        <button
          onClick={() => setViewMode('events-only')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'events-only'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Events Only</span>
          <span className="sm:hidden">Events</span>
        </button>
      </div>

      {/* Content */}
      {viewMode === 'unified' ? (
        <UnifiedTimeline
          events={unifiedEvents}
          tasks={unifiedTasks}
          vendorBookings={unifiedVendorBookings}
          parentEventId={parentEventId}
        />
      ) : (
        <TimelineView
          events={timelineEvents}
          parentEventId={parentEventId}
          weddingDate={weddingDate}
        />
      )}
    </div>
  );
}
