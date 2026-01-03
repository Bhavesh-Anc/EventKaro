'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';
import { SeatingChart, TableConfig, GuestSeat } from '@/components/features/seating-chart';
import {
  createSeatingTable,
  updateSeatingTable,
  deleteSeatingTable,
  assignGuestToTable,
  removeGuestFromTable,
  autoAssignSeating,
} from '@/actions/seating';

interface Props {
  eventId: string;
  initialTables: any[];
  initialGuests: any[];
}

export function SeatingClient({ eventId, initialTables, initialGuests }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tables, setTables] = useState<TableConfig[]>(
    initialTables.map((t: any) => ({
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      shape: t.shape,
      category: t.category,
    }))
  );
  const [guests, setGuests] = useState<GuestSeat[]>(initialGuests);

  const handleAssignGuest = async (guestId: string, tableId: string, seatNumber: number) => {
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, tableId, seatNumber } : g
      )
    );

    startTransition(async () => {
      const result = await assignGuestToTable(guestId, tableId, seatNumber);
      if (result.error) {
        // Revert on error
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId ? { ...g, tableId: null, seatNumber: null } : g
          )
        );
      }
    });
  };

  const handleRemoveGuest = async (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    // Optimistic update
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, tableId: null, seatNumber: null } : g
      )
    );

    startTransition(async () => {
      const result = await removeGuestFromTable(guestId);
      if (result.error) {
        // Revert on error
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId ? { ...g, tableId: guest.tableId, seatNumber: guest.seatNumber } : g
          )
        );
      }
    });
  };

  const handleAddTable = async (table: Omit<TableConfig, 'id'>) => {
    startTransition(async () => {
      const result = await createSeatingTable(eventId, table);
      if (result.success && result.table) {
        setTables((prev) => [
          ...prev,
          {
            id: result.table.id,
            name: result.table.name,
            capacity: result.table.capacity,
            shape: result.table.shape,
            category: result.table.category,
          },
        ]);
      }
    });
  };

  const handleEditTable = async (tableId: string, updates: Partial<TableConfig>) => {
    // Optimistic update
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t))
    );

    startTransition(async () => {
      const result = await updateSeatingTable(tableId, updates);
      if (result.error) {
        router.refresh();
      }
    });
  };

  const handleDeleteTable = async (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Optimistic update
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setGuests((prev) =>
      prev.map((g) =>
        g.tableId === tableId ? { ...g, tableId: null, seatNumber: null } : g
      )
    );

    startTransition(async () => {
      const result = await deleteSeatingTable(tableId);
      if (result.error) {
        router.refresh();
      }
    });
  };

  const handleAutoAssign = async () => {
    startTransition(async () => {
      const result = await autoAssignSeating(eventId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Auto-assign button */}
      <div className="flex justify-end">
        <button
          onClick={handleAutoAssign}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all disabled:opacity-50"
        >
          <Wand2 className="h-4 w-4" />
          {isPending ? 'Processing...' : 'Auto-Assign Guests'}
        </button>
      </div>

      <SeatingChart
        tables={tables}
        guests={guests}
        onAssignGuest={handleAssignGuest}
        onRemoveGuest={handleRemoveGuest}
        onAddTable={handleAddTable}
        onEditTable={handleEditTable}
        onDeleteTable={handleDeleteTable}
      />
    </div>
  );
}
