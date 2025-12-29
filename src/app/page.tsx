import Link from 'next/link';
import { Heart, Users, Calendar, IndianRupee, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
        <div className="max-w-5xl w-full text-center">
          {/* Logo/Badge */}
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg">
              <Heart className="h-10 w-10 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            EventKaro
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-3 font-semibold">
            Your Dream Wedding, Perfectly Planned
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            India's premier wedding management platform. Plan multi-event celebrations,
            manage guests, track budgets, and coordinate vendors - all in one place.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 px-8 py-4 text-lg font-semibold text-white hover:from-rose-800 hover:to-rose-950 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Start Planning Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-rose-700 px-8 py-4 text-lg font-semibold text-rose-700 hover:bg-rose-50 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Multi-Event Timeline */}
            <div className="rounded-xl border-2 border-rose-200 bg-white p-6 hover:shadow-lg transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 mb-4">
                <Calendar className="h-6 w-6 text-rose-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Multi-Event Weddings</h3>
              <p className="text-sm text-gray-600">
                Manage Engagement, Mehendi, Haldi, Sangeet, Wedding & Reception - all with separate timelines
              </p>
            </div>

            {/* Smart Guest Management */}
            <div className="rounded-xl border-2 border-amber-200 bg-white p-6 hover:shadow-lg transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 mb-4">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Smart Guest Management</h3>
              <p className="text-sm text-gray-600">
                Family hierarchies, RSVP tracking, accommodation bookings, and transportation scheduling
              </p>
            </div>

            {/* Budget Tracker */}
            <div className="rounded-xl border-2 border-rose-200 bg-white p-6 hover:shadow-lg transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 mb-4">
                <IndianRupee className="h-6 w-6 text-rose-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Budget Tracker</h3>
              <p className="text-sm text-gray-600">
                Track expenses per event, category-wise breakdown, and real-time budget variance analysis
              </p>
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 border-2 border-rose-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose EventKaro?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {[
                'Vendor contract management with deliverables tracking',
                'Private vendor reliability scoring based on real data',
                'Hotel inventory & room allocation for guests',
                'Transportation scheduling for airport/station pickups',
                'WhatsApp integration for family group coordination',
                'Conflict detection for overlapping events',
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-rose-700 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor CTA */}
          <div className="mt-12 p-6 rounded-xl bg-gray-900 text-white">
            <h3 className="text-2xl font-bold mb-2">Are you a Wedding Vendor?</h3>
            <p className="text-gray-300 mb-4">Join our platform to connect with couples and grow your business</p>
            <Link
              href="/vendors/register"
              className="inline-block rounded-lg bg-white px-6 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-100 transition-all"
            >
              Register as Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
