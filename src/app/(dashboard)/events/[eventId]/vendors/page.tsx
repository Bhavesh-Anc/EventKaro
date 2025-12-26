import { getEvent } from '@/actions/events';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';

export default async function EventVendorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  // TODO: Fetch actual vendor bookings and quotes from database
  const vendorBookings: any[] = [];
  const pendingQuotes: any[] = [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendor Management</h2>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <Link
            href="/vendors"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse Vendor Marketplace
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Vendors</h3>
          <p className="mt-2 text-3xl font-bold">{vendorBookings.length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Pending Quotes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">{pendingQuotes.length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Confirmed</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {vendorBookings.filter((b: any) => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Total Cost</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">₹0</p>
        </div>
      </div>

      {/* Booked Vendors */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Booked Vendors</h3>
        {vendorBookings.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No vendors booked yet"
            description="Browse the vendor marketplace to find and book vendors for your event"
            action={{
              label: "Browse Vendors",
              href: "/vendors"
            }}
          />
        ) : (
          <div className="space-y-4">
            {vendorBookings.map((booking: any) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{booking.vendor_name}</h4>
                    <p className="text-sm text-muted-foreground">{booking.service_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{booking.amount?.toLocaleString()}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Quotes */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Quote Requests</h3>
        {pendingQuotes.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No pending quote requests"
            description="Quote requests will appear here when you request quotes from vendors"
          />
        ) : (
          <div className="space-y-4">
            {pendingQuotes.map((quote: any) => (
              <div key={quote.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{quote.vendor_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    Waiting for Response
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vendor Categories */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Find Vendors by Category</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/vendors?category=photographers"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">📸</div>
            <h4 className="font-medium">Photographers</h4>
          </Link>
          <Link
            href="/vendors?category=caterers"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">🍽️</div>
            <h4 className="font-medium">Caterers</h4>
          </Link>
          <Link
            href="/vendors?category=decorators"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">🎨</div>
            <h4 className="font-medium">Decorators</h4>
          </Link>
          <Link
            href="/vendors?category=entertainment"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">🎵</div>
            <h4 className="font-medium">Entertainment</h4>
          </Link>
          <Link
            href="/vendors?category=venues"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">🏛️</div>
            <h4 className="font-medium">Venues</h4>
          </Link>
          <Link
            href="/vendors?category=florists"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">💐</div>
            <h4 className="font-medium">Florists</h4>
          </Link>
          <Link
            href="/vendors?category=makeup"
            className="rounded-md border p-4 text-center hover:bg-muted block"
          >
            <div className="text-3xl mb-2">💄</div>
            <h4 className="font-medium">Makeup Artists</h4>
          </Link>
          <Link
            href="/vendors"
            className="rounded-md border p-4 text-center hover:bg-muted block bg-primary/5"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h4 className="font-medium">View All</h4>
          </Link>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">💡 Vendor Management Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Request quotes from multiple vendors to compare pricing and services</li>
          <li>• Confirm vendor availability for your event date before booking</li>
          <li>• Keep track of payment schedules and advance payments</li>
          <li>• Review vendor contracts carefully before signing</li>
          <li>• Maintain regular communication with booked vendors</li>
        </ul>
      </div>
    </div>
  );
}
