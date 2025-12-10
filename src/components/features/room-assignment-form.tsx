'use client';

import { useTransition } from 'react';
import { assignGuestToRoom } from '@/actions/accommodations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RoomAssignmentFormProps {
  eventId: string;
  accommodationId: string;
  unassignedGuests: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  }>;
}

export function RoomAssignmentForm({
  eventId,
  accommodationId,
  unassignedGuests,
}: RoomAssignmentFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await assignGuestToRoom(formData);
    });
  };

  if (unassignedGuests.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        All attending guests have been assigned to rooms. Add more guests or change
        their RSVP status to "Attending" to assign them.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="accommodation_id" value={accommodationId} />

      <div>
        <Label htmlFor="guest_id">Select Guest *</Label>
        <select
          id="guest_id"
          name="guest_id"
          required
          disabled={isPending}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Choose a guest...</option>
          {unassignedGuests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.first_name} {guest.last_name}
              {guest.email ? ` (${guest.email})` : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Only guests with "Attending" RSVP status are shown
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="room_number">Room Number</Label>
          <Input
            id="room_number"
            name="room_number"
            type="text"
            disabled={isPending}
            placeholder="101"
          />
        </div>
        <div>
          <Label htmlFor="room_type">Room Type</Label>
          <select
            id="room_type"
            name="room_type"
            disabled={isPending}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select type...</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Twin">Twin</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          name="notes"
          type="text"
          disabled={isPending}
          placeholder="Special requests, preferences, etc."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Assigning...' : 'Assign to Room'}
      </button>
    </form>
  );
}
