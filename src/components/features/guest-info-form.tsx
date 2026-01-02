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

const RELATIONSHIP_OPTIONS = [
  { group: "Bride's Side", options: [
    { value: 'bride_family', label: "Bride's Family" },
    { value: 'bride_relative', label: "Bride's Relative" },
    { value: 'bride_friend', label: "Bride's Friend" },
  ]},
  { group: "Groom's Side", options: [
    { value: 'groom_family', label: "Groom's Family" },
    { value: 'groom_relative', label: "Groom's Relative" },
    { value: 'groom_friend', label: "Groom's Friend" },
  ]},
  { group: "Common", options: [
    { value: 'mutual_friend', label: "Mutual Friend" },
    { value: 'colleague', label: "Colleague" },
    { value: 'neighbor', label: "Neighbor" },
    { value: 'vip', label: "VIP Guest" },
    { value: 'other', label: "Other" },
  ]},
];

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

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            defaultValue={guest.whatsapp_number || ''}
            disabled={isPending}
            placeholder="Leave empty if same as phone"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="relationship">Relationship</Label>
          <select
            id="relationship"
            name="relationship"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={guest.relationship || ''}
            disabled={isPending}
          >
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="relationship_detail">Relationship Detail</Label>
          <Input
            id="relationship_detail"
            name="relationship_detail"
            type="text"
            defaultValue={guest.relationship_detail || ''}
            disabled={isPending}
            placeholder="e.g., Mama's son"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age_group">Age Group</Label>
          <select
            id="age_group"
            name="age_group"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={guest.age_group || ''}
            disabled={isPending}
          >
            <option value="">Select age</option>
            <option value="child">Child (0-12)</option>
            <option value="teen">Teen (13-19)</option>
            <option value="adult">Adult (20-59)</option>
            <option value="senior">Senior (60+)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={guest.priority || 'standard'}
            disabled={isPending}
          >
            <option value="vip">VIP - Must attend</option>
            <option value="high">High Priority</option>
            <option value="standard">Standard</option>
            <option value="optional">Optional</option>
          </select>
        </div>
        <div>
          <Label htmlFor="preferred_contact">Preferred Contact</Label>
          <select
            id="preferred_contact"
            name="preferred_contact"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={guest.preferred_contact || 'whatsapp'}
            disabled={isPending}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
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
