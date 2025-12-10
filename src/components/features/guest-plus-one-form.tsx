'use client';

import { useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GuestPlusOneFormProps {
  guest: any;
  eventId: string;
  updateAction: (formData: FormData) => Promise<any>;
}

export function GuestPlusOneForm({
  guest,
  eventId,
  updateAction,
}: GuestPlusOneFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateAction(formData);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="guest_id" value={guest.id} />
      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex items-center gap-2">
        <input
          id="plus_one_allowed"
          name="plus_one_allowed"
          type="checkbox"
          className="rounded border focus:ring-2 focus:ring-primary"
          defaultChecked={guest.plus_one_allowed}
          disabled={isPending}
        />
        <Label htmlFor="plus_one_allowed">Allow Plus One</Label>
      </div>

      <div>
        <Label htmlFor="plus_one_name">Plus One Name</Label>
        <Input
          id="plus_one_name"
          name="plus_one_name"
          type="text"
          defaultValue={guest.plus_one_name || ''}
          disabled={isPending}
          placeholder="Enter name if known"
        />
      </div>

      <div>
        <Label htmlFor="plus_one_rsvp">Plus One RSVP Status</Label>
        <select
          id="plus_one_rsvp"
          name="plus_one_rsvp"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={guest.plus_one_rsvp || ''}
          disabled={isPending}
        >
          <option value="">Not Responded</option>
          <option value="pending">Pending</option>
          <option value="attending">Attending</option>
          <option value="not_attending">Not Attending</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Update Plus One'}
      </button>
    </form>
  );
}
