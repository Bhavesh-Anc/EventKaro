'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Palette, Truck, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  calculateEventStatus,
  getEventDisplayName,
  getStatusIcon,
  getStatusLabel,
  type WeddingEventData,
} from '@/lib/wedding-status';
import { EditEventModal } from './edit-event-modal';

interface Props {
  event: WeddingEventData;
  allEvents: WeddingEventData[];
  onClose: () => void;
}

/**
 * EVENT DETAIL PANEL
 *
 * Opens on the right side when an event is clicked
 * This is where real work happens - editing, assignments, budgets
 */
export function EventDetailPanel({ event, allEvents, onClose }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);

  const statusDetails = calculateEventStatus(event, allEvents);
  const eventName = getEventDisplayName(event);
  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);

  return (
    <>
      {showEditModal && (
        <EditEventModal event={event} onClose={() => setShowEditModal(false)} />
      )}
    <div className="rounded-xl border-2 border-rose-300 bg-white shadow-xl">
      {/* Header */}
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{eventName}</h2>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon(statusDetails.status)}</span>
              <span className="text-sm font-semibold text-gray-700">
                {getStatusLabel(statusDetails.status)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* SECTION A - Event Basics */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Event Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {format(startDate, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-gray-600">
                  {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                </div>
                <div className="text-xs text-gray-500">
                  Duration: {event.duration_minutes || 0} minutes
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {event.venue_name || 'Venue not specified'}
                </div>
                {event.venue_address && (
                  <div className="text-sm text-gray-600">{event.venue_address}</div>
                )}
                {event.venue_city && event.venue_state && (
                  <div className="text-xs text-gray-500">
                    {event.venue_city}, {event.venue_state}
                  </div>
                )}
                {event.venue_type && (
                  <div className="text-xs text-gray-500 mt-1">
                    {event.venue_type === 'indoor' ? '🏛️ Indoor' : '🌳 Outdoor'}
                  </div>
                )}
              </div>
            </div>

            {event.description && (
              <div className="text-sm text-gray-600 pl-8">
                {event.description}
              </div>
            )}
          </div>
        </div>

        {/* SECTION B - Guest Subset */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Guest List
          </h3>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {event.expected_guest_count || 0} Guests Expected
                </div>
                {event.guest_subset && (
                  <div className="text-xs text-gray-600">
                    Subset: {event.guest_subset}
                  </div>
                )}
              </div>
            </div>
            {!event.guest_subset && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Guest subset not defined. Click to configure.</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION C - Vendor Assignments */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Vendor Assignments
          </h3>
          {event.vendor_assignments && event.vendor_assignments.length > 0 ? (
            <div className="space-y-2">
              {event.vendor_assignments.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {assignment.vendors.business_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {assignment.vendors.category}
                      </div>
                      {assignment.scope && (
                        <div className="text-xs text-gray-500 mt-1">
                          Scope: {assignment.scope}
                        </div>
                      )}
                      {assignment.arrival_time && (
                        <div className="text-xs text-gray-500">
                          Arrival: {format(parseISO(assignment.arrival_time), 'h:mm a')}
                        </div>
                      )}
                    </div>
                    <div>
                      {assignment.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <AlertCircle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-4">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>No vendors assigned yet. Click to add vendors.</span>
            </div>
          )}
        </div>

        {/* SECTION D - Budget Slice */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Budget
          </h3>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900">Event Budget</div>
              </div>
            </div>
            {event.budget ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allocated:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(event.budget.allocated_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Committed:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(event.budget.committed_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(event.budget.spent_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-rose-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((event.budget.spent_amount || 0) / (event.budget.allocated_amount || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Budget not set. Click to allocate budget.</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION E - Dress Code */}
        {(event.dress_code || event.color_theme) && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Dress Code & Theme
            </h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Palette className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="space-y-2">
                  {event.dress_code && (
                    <div>
                      <div className="text-xs text-gray-600">Dress Code</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {event.dress_code}
                      </div>
                    </div>
                  )}
                  {event.color_theme && (
                    <div>
                      <div className="text-xs text-gray-600">Color Theme</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {event.color_theme}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION F - Transport Plan */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Transport
          </h3>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {event.transport_required ? 'Transport Required' : 'No Transport Required'}
                </div>
                {event.transport_required && !event.transport_assigned && (
                  <div className="flex items-start gap-2 text-sm text-amber-700 mt-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Transport not assigned yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issues & Conflicts */}
        {(statusDetails.issues.length > 0 || statusDetails.conflicts.length > 0) && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Issues & Conflicts
            </h3>
            <div className="space-y-2">
              {statusDetails.conflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-900">{conflict}</span>
                </div>
              ))}
              {statusDetails.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-900">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all"
        >
          Edit Event Details
        </button>
      </div>
    </div>
    </>
  );
}
