import { getUserOrganizations } from '@/actions/organizations';
import { createEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function NewOtherEventPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Event</h2>
            <p className="text-gray-600">Set up your event details and start managing attendees</p>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        <input type="hidden" name="organization_id" value={currentOrg.id} />

        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Summer Tech Conference 2025"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">eventkaro.in/{currentOrg.slug}/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                pattern="[a-z0-9-]+"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="summer-tech-2025"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-generate from title
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Tell attendees what makes your event special..."
            />
          </div>

          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Select event type...</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="webinar">Webinar</option>
              <option value="meetup">Meetup</option>
              <option value="festival">Festival</option>
              <option value="party">Party</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                id="start_date"
                name="start_date"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                id="end_date"
                name="end_date"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Venue</h3>

          <div>
            <label htmlFor="venue_type" className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type *
            </label>
            <select
              id="venue_type"
              name="venue_type"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="physical">Physical Location</option>
              <option value="online">Online Event</option>
              <option value="hybrid">Hybrid (Physical + Online)</option>
            </select>
          </div>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name
            </label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Grand Hotel & Convention Center"
            />
          </div>

          <div>
            <label htmlFor="venue_city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              id="venue_city"
              name="venue_city"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Mumbai"
            />
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Capacity & Pricing</h3>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Total Capacity
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited capacity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_free"
              name="is_free"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
              This is a free event
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            formAction={createEvent}
            className="flex-1 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 px-6 py-3 text-base font-semibold text-white hover:from-rose-800 hover:to-rose-950 shadow-lg hover:shadow-xl transition-all"
          >
            Create Event
          </button>
          <Link
            href="/events/new"
            className="rounded-lg border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
