import { getEvent } from '@/actions/events';
import {
  getAccommodation,
  deleteAccommodation,
  removeGuestFromRoom,
  getUnassignedGuests,
} from '@/actions/accommodations';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RoomAssignmentForm } from '@/components/features/room-assignment-form';

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; accommodationId: string }>;
}) {
  const { eventId, accommodationId } = await params;
  const event = await getEvent(eventId);
  const accommodation = await getAccommodation(accommodationId);
  const unassignedGuests = await getUnassignedGuests(eventId);

  if (!event || !accommodation) {
    redirect(`/events/${eventId}/accommodations`);
  }

  const utilizationPercent = accommodation.total_rooms_blocked > 0
    ? ((accommodation.guest_accommodations?.length || 0) / accommodation.total_rooms_blocked) * 100
    : 0;

  const handleDelete = async () => {
    'use server';
    await deleteAccommodation(accommodationId, eventId);
    redirect(`/events/${eventId}/accommodations`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href={`/events/${eventId}/accommodations`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Accommodations
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {accommodation.hotel_name}
            </h2>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <form action={handleDelete}>
            <button
              type="submit"
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete Hotel Block
            </button>
          </form>
        </div>
      </div>

      {/* Hotel Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Rooms</h3>
          <p className="mt-2 text-3xl font-bold">{accommodation.total_rooms_blocked}</p>
        </div>
        <div className="rounded-lg border p-6 bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Rooms Assigned</h3>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {accommodation.guest_accommodations?.length || 0}
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700">Available</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-700">
            {accommodation.total_rooms_blocked - (accommodation.guest_accommodations?.length || 0)}
          </p>
        </div>
      </div>

      {/* Utilization Progress */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Room Utilization</h3>
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
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Hotel Details */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Hotel Details</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {accommodation.hotel_address && (
            <div>
              <span className="text-muted-foreground">Address:</span>{' '}
              <span className="font-medium">{accommodation.hotel_address}</span>
            </div>
          )}
          {accommodation.hotel_phone && (
            <div>
              <span className="text-muted-foreground">Phone:</span>{' '}
              <span className="font-medium">{accommodation.hotel_phone}</span>
            </div>
          )}
          {accommodation.contact_person && (
            <div>
              <span className="text-muted-foreground">Contact Person:</span>{' '}
              <span className="font-medium">{accommodation.contact_person}</span>
            </div>
          )}
          {accommodation.check_in_date && accommodation.check_out_date && (
            <div>
              <span className="text-muted-foreground">Dates:</span>{' '}
              <span className="font-medium">
                {new Date(accommodation.check_in_date).toLocaleDateString()} -{' '}
                {new Date(accommodation.check_out_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {accommodation.notes && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Notes:</span>
            <p className="text-sm mt-1">{accommodation.notes}</p>
          </div>
        )}
      </div>

      {/* Assign Guest to Room */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Assign Guest to Room</h3>
        <RoomAssignmentForm
          eventId={eventId}
          accommodationId={accommodationId}
          unassignedGuests={unassignedGuests}
        />
      </div>

      {/* Assigned Guests */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Assigned Guests</h3>
        {!accommodation.guest_accommodations || accommodation.guest_accommodations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No guests assigned yet. Use the form above to assign guests to rooms.
          </p>
        ) : (
          <div className="space-y-3">
            {accommodation.guest_accommodations.map((assignment: any) => {
              const handleRemove = async () => {
                'use server';
                await removeGuestFromRoom(assignment.id, eventId);
              };

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {assignment.guest.first_name} {assignment.guest.last_name}
                        </p>
                        {assignment.guest.email && (
                          <p className="text-sm text-muted-foreground">
                            {assignment.guest.email}
                          </p>
                        )}
                      </div>
                      {assignment.room_number && (
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          Room {assignment.room_number}
                        </span>
                      )}
                      {assignment.room_type && (
                        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                          {assignment.room_type}
                        </span>
                      )}
                    </div>
                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                  <form action={handleRemove}>
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
