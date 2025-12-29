import { getUserOrganizations } from '@/actions/organizations';
import { createEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import { Heart, Calendar as CalendarIcon, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

export default async function NewEventPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent">
          Create Your Event
        </h2>
        <p className="text-gray-600 mt-2">
          Choose your event type to get started
        </p>
      </div>

      {/* Event Type Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Wedding Card - Featured */}
        <Link
          href="/events/new/wedding"
          className="group relative rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50 p-8 hover:shadow-xl hover:border-rose-500 transition-all cursor-pointer"
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold">
              RECOMMENDED
            </span>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg mb-4">
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Wedding</h3>
          <p className="text-gray-600 mb-4">
            Plan your dream wedding with multi-event timeline, guest management, vendor tracking, and budget control
          </p>
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <span>Get Started</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <div className="mt-4 pt-4 border-t border-rose-200">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>Multi-event</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Family hierarchy</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Other Events Card */}
        <Link
          href="/events/new/other"
          className="group rounded-2xl border-2 border-gray-200 bg-white p-8 hover:shadow-xl hover:border-gray-400 transition-all cursor-pointer"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Other Events</h3>
          <p className="text-gray-600 mb-4">
            Create conferences, workshops, concerts, meetups, festivals, and other celebrations
          </p>
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>Continue</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Perfect for corporate events, parties, and gatherings
            </p>
          </div>
        </Link>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
