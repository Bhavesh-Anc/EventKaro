import { Calendar, Clock, Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOtherEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/events/new"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Selection
      </Link>

      {/* Coming Soon Card */}
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 p-12 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-md">
              <Clock className="h-4 w-4 text-amber-900" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Coming Soon
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          We're working hard to bring you support for conferences, workshops, concerts, and other amazing events!
        </p>

        {/* Features Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Planned Features
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-700">Conference & Workshop Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-700">Ticket Sales & Registration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">Speaker & Session Scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-700">Attendee Check-in & Badges</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-sm text-gray-700">Event Analytics & Reports</span>
            </div>
          </div>
        </div>

        {/* Notify Me Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Get Notified</span>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            We'll let you know as soon as this feature is ready!
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded-lg border border-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Notify Me
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <p className="text-gray-500 mb-4">In the meantime, why not plan a wedding?</p>
          <Link
            href="/events/new/wedding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg font-semibold hover:from-rose-800 hover:to-rose-950 transition-all shadow-lg"
          >
            Create Wedding Event
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
