import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { Heart, Calendar as CalendarIcon, Sparkles, Users, Plus, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format, differenceInDays } from 'date-fns';

export default async function NewEventPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Fetch existing wedding events
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('id, title, start_date, venue_name, venue_city, status')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .order('start_date', { ascending: true });

  const hasWeddings = weddingEvents && weddingEvents.length > 0;

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
          {hasWeddings ? 'Your Weddings' : 'Create Your Event'}
        </h2>
        <p className="text-gray-600 mt-2">
          {hasWeddings
            ? 'Select a wedding to manage or create a new one'
            : 'Choose your event type to get started'}
        </p>
      </div>

      {/* Existing Weddings */}
      {hasWeddings && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Wedding Events</h3>
            <Link
              href="/events/new/wedding"
              className="flex items-center gap-2 text-sm font-medium text-rose-700 hover:text-rose-800"
            >
              <Plus className="h-4 w-4" />
              Create New Wedding
            </Link>
          </div>
          <div className="grid gap-4">
            {weddingEvents.map((wedding: any) => {
              const daysRemaining = differenceInDays(new Date(wedding.start_date), new Date());
              const isPast = daysRemaining < 0;

              return (
                <Link
                  key={wedding.id}
                  href={`/dashboard`}
                  className="group flex items-center gap-4 p-4 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 hover:border-rose-400 hover:shadow-lg transition-all"
                >
                  {/* Icon */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 to-rose-800 shadow-md">
                    <Heart className="h-7 w-7 text-white fill-white" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 truncate">
                      {wedding.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(wedding.start_date), 'dd MMM yyyy')}</span>
                      </div>
                      {wedding.venue_city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{wedding.venue_city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status / Days */}
                  <div className="text-right shrink-0">
                    {isPast ? (
                      <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        Completed
                      </span>
                    ) : daysRemaining === 0 ? (
                      <span className="inline-flex px-3 py-1 rounded-full bg-rose-600 text-white text-sm font-bold animate-pulse">
                        Today!
                      </span>
                    ) : daysRemaining <= 7 ? (
                      <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                        {daysRemaining} days left
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        {daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      {hasWeddings && (
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or create a new event</span>
          </div>
        </div>
      )}

      {/* Event Type Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Wedding Card - Featured */}
        <Link
          href="/events/new/wedding"
          className="group relative rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50 p-8 hover:shadow-xl hover:border-rose-500 transition-all cursor-pointer"
        >
          {!hasWeddings && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold">
                RECOMMENDED
              </span>
            </div>
          )}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg mb-4">
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasWeddings ? 'New Wedding' : 'Wedding'}
          </h3>
          <p className="text-gray-600 mb-4">
            Plan your dream wedding with multi-event timeline, guest management, vendor tracking, and budget control
          </p>
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <span>{hasWeddings ? 'Create Another' : 'Get Started'}</span>
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
          className="group rounded-2xl border-2 border-gray-200 bg-white p-8 hover:shadow-xl hover:border-gray-400 transition-all cursor-pointer relative overflow-hidden"
        >
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              COMING SOON
            </span>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Other Events</h3>
          <p className="text-gray-600 mb-4">
            Create conferences, workshops, concerts, meetups, festivals, and other celebrations
          </p>
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>Learn More</span>
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
