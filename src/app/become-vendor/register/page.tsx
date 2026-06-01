import Link from 'next/link';
import { Store, CheckCircle2, Star, Users, TrendingUp, Shield } from 'lucide-react';

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Grow Your Wedding Business
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join EventKaro's vendor marketplace and connect with couples planning their dream weddings
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Why Partner With Us?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Users className="h-10 w-10 text-rose-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access to Clients</h3>
            <p className="text-gray-600">
              Get discovered by couples actively planning their weddings. Our platform matches
              you with relevant inquiries based on your services and location.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <TrendingUp className="h-10 w-10 text-rose-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Growth</h3>
            <p className="text-gray-600">
              Track bookings, manage contracts, and receive payments - all through our
              streamlined vendor dashboard designed for wedding professionals.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Star className="h-10 w-10 text-rose-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your Reputation</h3>
            <p className="text-gray-600">
              Collect reviews from satisfied clients. Our reliability scoring helps top vendors
              stand out and get more bookings.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Shield className="h-10 w-10 text-rose-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Get paid on time with our milestone-based payment system. Track outstanding
              payments and send automated reminders.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Categories We Serve
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Photographers', 'Videographers', 'Decorators', 'Caterers',
              'Makeup Artists', 'Mehendi Artists', 'DJs', 'Bands',
              'Florists', 'Invitation Designers', 'Choreographers',
              'Event Planners', 'Pandits/Priests', 'Jewellers',
            ].map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Create your vendor profile today. It's free to join, and you only pay a small
            commission when you get booked through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?type=vendor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800 transition-colors"
            >
              Create Vendor Profile
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Already Have an Account?
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-gray-500">
            <div>
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div>Active Vendors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2000+</div>
              <div>Weddings Planned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">10+</div>
              <div>Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 px-6 text-center">
        <Link href="/" className="text-rose-300 hover:text-rose-200">
          ← Back to EventKaro
        </Link>
      </div>
    </div>
  );
}
