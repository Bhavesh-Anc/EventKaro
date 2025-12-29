'use client';

import { useState, useTransition } from 'react';
import { X, Calendar, MapPin, Users, Palette, Truck, Save, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { updateWeddingEvent, deleteWeddingEvent } from '@/actions/wedding-timeline';
import { getEventDisplayName, type WeddingEventData } from '@/lib/wedding-status';
import { useRouter } from 'next/navigation';

interface Props {
  event: WeddingEventData;
  onClose: () => void;
}

export function EditEventModal({ event, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventName = getEventDisplayName(event);
  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateWeddingEvent(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${eventName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteWeddingEvent(event.id);
    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">Edit Event</h2>
              <p className="text-rose-100">{eventName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <input type="hidden" name="event_id" value={event.id} />

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Event Name (for custom events only) */}
          {event.event_name === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Event Name
              </label>
              <input
                type="text"
                name="custom_event_name"
                defaultValue={event.custom_event_name || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., Tilak, Chooda, Griha Pravesh"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={event.description || ''}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Brief description of the event"
            />
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="start_datetime"
                defaultValue={format(startDate, "yyyy-MM-dd'T'HH:mm")}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="end_datetime"
                defaultValue={format(endDate, "yyyy-MM-dd'T'HH:mm")}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Venue Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Venue Details
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Venue Name
              </label>
              <input
                type="text"
                name="venue_name"
                defaultValue={event.venue_name || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., Taj Palace, The Grand Ballroom"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Venue Address
              </label>
              <input
                type="text"
                name="venue_address"
                defaultValue={event.venue_address || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Street address"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="venue_city"
                  defaultValue={event.venue_city || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="venue_state"
                  defaultValue={event.venue_state || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Maharashtra"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Venue Type
              </label>
              <select
                name="venue_type"
                defaultValue={event.venue_type || ''}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Select venue type</option>
                <option value="indoor">🏛️ Indoor</option>
                <option value="outdoor">🌳 Outdoor</option>
              </select>
            </div>
          </div>

          {/* Guest Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guest Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expected Guest Count
                </label>
                <input
                  type="number"
                  name="expected_guest_count"
                  min="0"
                  defaultValue={event.expected_guest_count || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., 250"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Guest Subset
                </label>
                <select
                  name="guest_subset"
                  defaultValue={event.guest_subset || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select subset</option>
                  <option value="all">All Guests</option>
                  <option value="bride_side">Bride's Side</option>
                  <option value="groom_side">Groom's Side</option>
                  <option value="vip">VIP Only</option>
                  <option value="family">Family Only</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dress Code & Theme */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Dress Code & Theme
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dress Code
                </label>
                <input
                  type="text"
                  name="dress_code"
                  defaultValue={event.dress_code || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Traditional Indian Wear, Cocktail Attire"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Color Theme
                </label>
                <input
                  type="text"
                  name="color_theme"
                  defaultValue={event.color_theme || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Royal Blue & Gold, Pastel Pink"
                />
              </div>
            </div>
          </div>

          {/* Transport */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4" />
              Transport
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="transport_required"
                value="true"
                defaultChecked={event.transport_required || false}
                className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-900">Transport required for this event</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
