import { getUserOrganizations } from '@/actions/organizations';
import { createEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default async function NewWeddingPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg">
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent">
          Plan Your Dream Wedding
        </h2>
        <p className="text-gray-600 mt-2">
          Let's start with the basic details of your special day
        </p>
      </div>

      <form className="space-y-6">
        <input type="hidden" name="organization_id" value={currentOrg.id} />
        <input type="hidden" name="event_type" value="wedding" />
        <input type="hidden" name="venue_type" value="physical" />
        <input type="hidden" name="is_free" value="on" />

        {/* Couple Details */}
        <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Couple Details</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Wedding Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Rahul & Priya's Wedding"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Rahul & Priya's Wedding" or "The Sharma-Gupta Wedding"
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Wedding Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Share your love story or a message for your guests..."
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Wedding URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">eventkaro.in/{currentOrg.slug}/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                pattern="[a-z0-9-]+"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="rahul-priya-wedding"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-generate from title
            </p>
          </div>
        </div>

        {/* Wedding Date & Venue */}
        <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Date & Venue</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Date *
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                For multi-day celebrations
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-2">
              Main Venue Name
            </label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="The Grand Palace, Mumbai"
            />
          </div>

          <div>
            <label htmlFor="venue_city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              id="venue_city"
              name="venue_city"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Mumbai"
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Guest Count
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="350"
            />
            <p className="text-xs text-gray-500 mt-1">
              Approximate number of guests you plan to invite
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Create your wedding event with the basic details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Set up multi-event timeline (Engagement, Mehendi, Sangeet, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Add guests with family hierarchy and RSVP tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600">✓</span>
              <span>Manage budget, vendors, and tasks - all in one place!</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            formAction={createEvent}
            className="flex-1 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 px-6 py-3 text-base font-semibold text-white hover:from-rose-800 hover:to-rose-950 shadow-lg hover:shadow-xl transition-all"
          >
            Create Wedding Event
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
