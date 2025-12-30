'use client';

import { useState } from 'react';
import { WeddingEvent, updateWeddingEvent, deleteWeddingEvent } from '@/actions/wedding-events';
import { Button } from '@/components/ui/button';
import { Trash2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Props {
  event: WeddingEvent;
  parentEventId: string;
}

const EVENT_LABELS: Record<string, string> = {
  engagement: 'Engagement',
  mehendi: 'Mehendi',
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  wedding: 'Wedding Ceremony',
  reception: 'Reception',
  custom: 'Custom Event',
};

export function WeddingEventEditForm({ event, parentEventId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Format datetime for input (datetime-local expects YYYY-MM-DDTHH:MM format)
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWeddingEvent(event.id, parentEventId);
      router.push(`/events/${parentEventId}/wedding-timeline`);
      router.refresh();
    } catch (error) {
      alert(`Error deleting event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateWeddingEvent(event.id, formData);
      router.push(`/events/${parentEventId}/wedding-timeline`);
      router.refresh();
    } catch (error) {
      alert(`Error updating event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="parent_event_id" value={parentEventId} />

      {/* Event Type (Read-only) */}
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold mb-2">Event Type</h3>
        <p className="text-2xl font-bold text-rose-900">
          {event.custom_event_name || EVENT_LABELS[event.event_name]}
        </p>
        <p className="text-sm text-gray-600 mt-1">Event type cannot be changed after creation</p>
      </div>

      {/* Date & Time */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Date & Time</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_datetime"
              required
              defaultValue={formatDateTimeLocal(event.start_datetime)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_datetime"
              required
              defaultValue={formatDateTimeLocal(event.end_datetime)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Duration: {event.duration_minutes} minutes
        </p>
      </div>

      {/* Venue Details */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Venue Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name
            </label>
            <input
              type="text"
              name="venue_name"
              defaultValue={event.venue_name || ''}
              placeholder="Enter venue name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="venue_address"
              rows={2}
              defaultValue={event.venue_address || ''}
              placeholder="Full address"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="venue_city"
              defaultValue={event.venue_city || ''}
              placeholder="City name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Guest & Style */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Guests & Style</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Guest Count
            </label>
            <input
              type="number"
              name="expected_guest_count"
              min="0"
              defaultValue={event.expected_guest_count || ''}
              placeholder="Number of guests"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dress Code
            </label>
            <input
              type="text"
              name="dress_code"
              defaultValue={event.dress_code || ''}
              placeholder="e.g., Traditional Indian, Semi-Formal"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme Colors (comma-separated hex codes)
          </label>
          <input
            type="text"
            name="theme_colors"
            defaultValue={event.theme_colors?.join(', ') || ''}
            placeholder="e.g., #FF6B9D, #C44569, #FFC048"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple colors with commas
          </p>
        </div>
      </div>

      {/* Status & Notes */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Status & Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Status
            </label>
            <select
              name="status"
              defaultValue={event.status}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={event.description || ''}
              placeholder="Brief description of this event"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={event.notes || ''}
              placeholder="Private notes for planning (not visible to guests)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/events/${parentEventId}/wedding-timeline`)}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2"
        >
          {isDeleting ? (
            <>Deleting...</>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </div>

      {/* Warning for Standard Events */}
      {event.event_name !== 'custom' && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            💡 <strong>Tip:</strong> This is a standard event ({EVENT_LABELS[event.event_name]}).
            Consider carefully before deleting as it's a common wedding ceremony.
          </p>
        </div>
      )}
    </form>
  );
}
