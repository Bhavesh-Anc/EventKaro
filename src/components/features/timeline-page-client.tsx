'use client';

import { useState } from 'react';
import { Calendar, LayoutGrid, Plus, Share2, Copy, Check } from 'lucide-react';
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
  eventSlug?: string;
}

type ViewMode = 'unified' | 'events-only';

export function TimelinePageClient({
  timelineEvents,
  unifiedEvents,
  unifiedTasks,
  unifiedVendorBookings,
  parentEventId,
  weddingDate,
  eventSlug,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('unified');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = eventSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/timeline/${eventSlug}`
    : null;

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          {eventSlug && (
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
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

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Timeline</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with vendors, family, or guests to let them view the event schedule.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-colors ${
                  copied ? 'bg-green-100 text-green-700' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Anyone with this link can view the event schedule. No login required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
