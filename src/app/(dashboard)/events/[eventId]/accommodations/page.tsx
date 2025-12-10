import { getEvent } from '@/actions/events';
import { getEventAccommodations } from '@/actions/accommodations';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const accommodations = await getEventAccommodations(eventId);

  // Calculate total stats
  const totalRooms = accommodations.reduce((sum, acc) => sum + (acc.total_rooms_blocked || 0), 0);
  const assignedRooms = accommodations.reduce((sum, acc) => sum + (acc.rooms_assigned || 0), 0);
  const availableRooms = totalRooms - assignedRooms;

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
            <h2 className="text-3xl font-bold tracking-tight">Accommodations</h2>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <Link
            href={`/events/${eventId}/accommodations/new`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Hotel Block
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Hotels</h3>
          <p className="mt-2 text-3xl font-bold">{accommodations.length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Total Rooms Blocked</h3>
          <p className="mt-2 text-3xl font-bold text-blue-700">{totalRooms}</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Rooms Assigned</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">{assignedRooms}</p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Available Rooms</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">{availableRooms}</p>
        </div>
      </div>

      {/* Accommodation List */}
      {accommodations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No hotel blocks yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding hotel blocks for your guests
          </p>
          <Link
            href={`/events/${eventId}/accommodations/new`}
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add First Hotel Block
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {accommodations.map((accommodation) => {
            const utilizationPercent = accommodation.total_rooms_blocked > 0
              ? (accommodation.rooms_assigned / accommodation.total_rooms_blocked) * 100
              : 0;

            return (
              <Link
                key={accommodation.id}
                href={`/events/${eventId}/accommodations/${accommodation.id}`}
                className="rounded-lg border p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{accommodation.hotel_name}</h3>
                    {accommodation.hotel_address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {accommodation.hotel_address}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      utilizationPercent >= 100
                        ? 'bg-red-100 text-red-800'
                        : utilizationPercent >= 80
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {utilizationPercent.toFixed(0)}% filled
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {accommodation.contact_person && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{accommodation.contact_person}</span>
                    </div>
                  )}
                  {accommodation.hotel_phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{accommodation.hotel_phone}</span>
                    </div>
                  )}
                  {accommodation.check_in_date && accommodation.check_out_date && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Dates:</span>
                      <span className="font-medium">
                        {new Date(accommodation.check_in_date).toLocaleDateString()} -{' '}
                        {new Date(accommodation.check_out_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Room Utilization</span>
                    <span className="font-semibold">
                      {accommodation.rooms_assigned} / {accommodation.total_rooms_blocked} rooms
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
