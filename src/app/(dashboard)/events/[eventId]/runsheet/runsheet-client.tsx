'use client';

import { useRouter } from 'next/navigation';
import { EventDayRunsheet } from '@/components/features/event-day-runsheet';
import {
  addRunsheetItem,
  updateRunsheetItemStatus,
  updateRunsheetItem,
} from '@/actions/runsheet';

interface RunsheetItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  assignedTo?: string[];
  category: 'ceremony' | 'ritual' | 'photo' | 'food' | 'entertainment' | 'logistics' | 'transition' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  notes?: string;
  isImportant?: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  delayMinutes?: number;
}

interface Props {
  eventId: string;
  eventDate: string;
  eventName: string;
  initialItems: RunsheetItem[];
}

export function RunsheetClient({
  eventId,
  eventDate,
  eventName,
  initialItems,
}: Props) {
  const router = useRouter();

  const handleStatusChange = async (id: string, status: RunsheetItem['status']) => {
    await updateRunsheetItemStatus(id, status);
    router.refresh();
  };

  const handleItemUpdate = async (id: string, updates: Partial<RunsheetItem>) => {
    await updateRunsheetItem(id, updates);
    router.refresh();
  };

  const handleAddItem = async (item: Omit<RunsheetItem, 'id'>) => {
    await addRunsheetItem(eventId, item);
    router.refresh();
  };

  return (
    <EventDayRunsheet
      eventDate={eventDate}
      eventName={eventName}
      items={initialItems}
      onStatusChange={handleStatusChange}
      onItemUpdate={handleItemUpdate}
      onAddItem={handleAddItem}
      isLiveMode={false}
    />
  );
}
