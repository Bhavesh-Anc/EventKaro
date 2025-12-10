import { getEvent } from '@/actions/events';
import { addAccommodation } from '@/actions/accommodations';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function NewAccommodationPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href={`/events/${eventId}/accommodations`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Accommodations
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add Hotel Block</h2>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <form action={addAccommodation} className="space-y-6">
        <input type="hidden" name="event_id" value={eventId} />

        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Hotel Information</h3>

          <div>
            <Label htmlFor="hotel_name">Hotel Name *</Label>
            <Input
              id="hotel_name"
              name="hotel_name"
              type="text"
              required
              placeholder="Taj Palace Hotel"
            />
          </div>

          <div>
            <Label htmlFor="hotel_address">Hotel Address</Label>
            <Input
              id="hotel_address"
              name="hotel_address"
              type="text"
              placeholder="123 Main Street, Mumbai, Maharashtra 400001"
            />
          </div>

          <div>
            <Label htmlFor="hotel_phone">Hotel Phone</Label>
            <Input
              id="hotel_phone"
              name="hotel_phone"
              type="tel"
              placeholder="+91 22 1234 5678"
            />
          </div>

          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              name="contact_person"
              type="text"
              placeholder="Hotel manager or coordinator name"
            />
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Room Block Details</h3>

          <div>
            <Label htmlFor="total_rooms_blocked">Total Rooms Blocked *</Label>
            <Input
              id="total_rooms_blocked"
              name="total_rooms_blocked"
              type="number"
              required
              min="1"
              placeholder="50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of rooms reserved for your event
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_in_date">Check-in Date</Label>
              <Input
                id="check_in_date"
                name="check_in_date"
                type="date"
              />
            </div>
            <div>
              <Label htmlFor="check_out_date">Check-out Date</Label>
              <Input
                id="check_out_date"
                name="check_out_date"
                type="date"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Special rates, amenities, group code, etc."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Hotel Block
          </button>
          <Link
            href={`/events/${eventId}/accommodations`}
            className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>

      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Tips for Managing Hotel Blocks</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Negotiate group rates with the hotel for best pricing</li>
          <li>• Get a cut-off date for room reservations</li>
          <li>• Request a group code for your guests to use when booking</li>
          <li>• Consider proximity to event venue when selecting hotels</li>
          <li>• Block rooms at different price points for guest flexibility</li>
        </ul>
      </div>
    </div>
  );
}
