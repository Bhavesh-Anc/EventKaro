import { getUserOrganizations } from '@/actions/organizations';
import { createEvent } from '@/actions/events';
import { redirect } from 'next/navigation';

export default async function NewEventPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
        <p className="text-muted-foreground mt-2">
          Set up your event details and start selling tickets
        </p>
      </div>

      <form className="space-y-6">
        <input type="hidden" name="organization_id" value={currentOrg.id} />

        {/* Basic Info */}
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Event Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Summer Tech Conference 2025"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              URL Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">eventkaro.in/{currentOrg.slug}/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                pattern="[a-z0-9-]+"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="summer-tech-2025"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to auto-generate from title
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell attendees what makes your event special..."
            />
          </div>

          <div>
            <label htmlFor="event_type" className="block text-sm font-medium mb-2">
              Event Type *
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="webinar">Webinar</option>
              <option value="meetup">Meetup</option>
              <option value="wedding">Wedding</option>
              <option value="festival">Festival</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Date & Time</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium mb-2">
                Start Date & Time *
              </label>
              <input
                id="start_date"
                name="start_date"
                type="datetime-local"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium mb-2">
                End Date & Time *
              </label>
              <input
                id="end_date"
                name="end_date"
                type="datetime-local"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Venue</h3>

          <div>
            <label htmlFor="venue_type" className="block text-sm font-medium mb-2">
              Venue Type *
            </label>
            <select
              id="venue_type"
              name="venue_type"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="physical">Physical Location</option>
              <option value="online">Online Event</option>
              <option value="hybrid">Hybrid (Physical + Online)</option>
            </select>
          </div>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium mb-2">
              Venue Name
            </label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Grand Hotel & Convention Center"
            />
          </div>

          <div>
            <label htmlFor="venue_city" className="block text-sm font-medium mb-2">
              City
            </label>
            <input
              id="venue_city"
              name="venue_city"
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mumbai"
            />
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Capacity & Pricing</h3>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium mb-2">
              Total Capacity
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="500"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for unlimited capacity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_free"
              name="is_free"
              type="checkbox"
              className="rounded border focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="is_free" className="text-sm font-medium">
              This is a free event
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            formAction={createEvent}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Event
          </button>
          <a
            href="/dashboard"
            className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
