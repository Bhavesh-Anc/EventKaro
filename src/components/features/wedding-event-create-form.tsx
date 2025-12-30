'use client';

import { useState } from 'react';
import { createWeddingEvent } from '@/actions/wedding-events';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  parentEventId: string;
  weddingDate: string;
}

export function WeddingEventCreateForm({ parentEventId, weddingDate }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Format datetime for input (datetime-local expects YYYY-MM-DDTHH:MM format)
  const formatDateTimeLocal = (dateString: string, addHours: number = 0) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + addHours);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Default to one day before wedding at 6pm
  const defaultStartTime = formatDateTimeLocal(weddingDate, -30); // 30 hours before
  const defaultEndTime = formatDateTimeLocal(weddingDate, -27); // 27 hours before (3 hour duration)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    formData.set('event_name', 'custom'); // All new events are custom

    try {
      await createWeddingEvent(formData);
      // Action redirects automatically
    } catch (error) {
      alert(`Error creating event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="parent_event_id" value={parentEventId} />

      {/* Event Name */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Event Name</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="custom_event_name"
            required
            placeholder="e.g., Tilak Ceremony, Pool Party, Chooda Ceremony"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Common custom events: Tilak, Chooda, Griha Pravesh, Jaggo, Pool Party, Cocktail Party
          </p>
        </div>
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
              defaultValue={defaultStartTime}
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
              defaultValue={defaultEndTime}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Default timing is set to the day before the wedding. Adjust as needed.
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
              placeholder="City name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="venue_state"
              placeholder="State name"
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
              placeholder="e.g., Traditional Indian, Semi-Formal, Casual"
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
            placeholder="e.g., #FF6B9D, #C44569, #FFC048"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple colors with commas
          </p>
        </div>
      </div>

      {/* Transportation */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Transportation</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="transportation_provided"
              name="transportation_provided"
              value="true"
              className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="transportation_provided" className="text-sm font-medium text-gray-700">
              Transportation will be provided for guests
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transportation Notes
            </label>
            <textarea
              name="transportation_notes"
              rows={2}
              placeholder="Details about pickup points, timings, contact info, etc."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Description & Notes */}
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Description & Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of this event (visible to guests)"
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
              placeholder="Private notes for planning (not visible to guests)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pb-8">
        <Button
          type="submit"
          disabled={isCreating}
          className="flex-1 bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950 flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>Creating...</>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Event
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
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> After creating the event, you can assign specific vendors,
          set budgets, and manage guest lists for this sub-event separately from other ceremonies.
        </p>
      </div>
    </form>
  );
}
