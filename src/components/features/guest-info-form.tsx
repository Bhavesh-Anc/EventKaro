'use client';

import { useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GuestInfoFormProps {
  guest: any;
  eventId: string;
  groups: any[];
  updateAction: (formData: FormData) => Promise<any>;
}

export function GuestInfoForm({
  guest,
  eventId,
  groups,
  updateAction,
}: GuestInfoFormProps) {
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            type="text"
            required
            defaultValue={guest.first_name}
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            type="text"
            defaultValue={guest.last_name || ''}
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={guest.email || ''}
          disabled={isPending}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={guest.phone || ''}
          disabled={isPending}
        />
      </div>

      {groups.length > 0 && (
        <div>
          <Label htmlFor="guest_group_id">Guest Group</Label>
          <select
            id="guest_group_id"
            name="guest_group_id"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={guest.guest_group_id || ''}
            disabled={isPending}
          >
            <option value="">No Group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={guest.notes || ''}
          disabled={isPending}
          placeholder="Any special requirements or notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
