'use client';

import { useRouter } from 'next/navigation';
import { EventDayMode } from '@/components/features/event-day-mode';
import { updateRunsheetItemStatus } from '@/actions/runsheet';

interface RunsheetItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  assignedTo?: string[];
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  delayMinutes?: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  category: string;
  isPrimary?: boolean;
}

interface Props {
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName?: string;
  runsheetItems: RunsheetItem[];
  emergencyContacts: EmergencyContact[];
}

export function LiveModeClient({
  eventId,
  eventName,
  eventDate,
  venueName,
  runsheetItems,
  emergencyContacts,
}: Props) {
  const router = useRouter();

  const handleStatusChange = async (itemId: string, status: RunsheetItem['status']) => {
    await updateRunsheetItemStatus(itemId, status);
    router.refresh();
  };

  const handleRefresh = async () => {
    router.refresh();
  };

  return (
    <EventDayMode
      eventId={eventId}
      eventName={eventName}
      eventDate={eventDate}
      venueName={venueName}
      runsheetItems={runsheetItems}
      emergencyContacts={emergencyContacts}
      onStatusChange={handleStatusChange}
      onRefresh={handleRefresh}
    />
  );
}
