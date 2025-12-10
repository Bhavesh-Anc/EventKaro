'use client';

import { useTransition } from 'react';

interface GuestRSVPFormProps {
  guestId: string;
  eventId: string;
  currentStatus: string;
  updateAction: (guestId: string, status: string) => Promise<any>;
}

export function GuestRSVPForm({
  guestId,
  eventId,
  currentStatus,
  updateAction,
}: GuestRSVPFormProps) {
  const [isPending, startTransition] = useTransition();

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'attending', label: 'Attending', color: 'bg-green-100 text-green-800' },
    { value: 'not_attending', label: 'Not Attending', color: 'bg-red-100 text-red-800' },
    { value: 'maybe', label: 'Maybe', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'no_response', label: 'No Response', color: 'bg-gray-100 text-gray-800' },
  ];

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await updateAction(guestId, status);
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Update the guest's RSVP status
      </p>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => handleStatusChange(status.value)}
            disabled={isPending || currentStatus === status.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              currentStatus === status.value
                ? status.color + ' ring-2 ring-primary'
                : 'border hover:bg-muted'
            } disabled:opacity-50`}
          >
            {status.label}
          </button>
        ))}
      </div>
      {isPending && (
        <p className="text-sm text-muted-foreground">Updating...</p>
      )}
    </div>
  );
}
