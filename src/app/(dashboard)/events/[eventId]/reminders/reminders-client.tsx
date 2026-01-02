'use client';

import { useRouter } from 'next/navigation';
import { ReminderDashboard } from '@/components/features/reminder-dashboard';
import {
  createReminder,
  updateReminder,
  deleteReminder,
  sendReminderNow,
  cancelReminder,
  createCountdownReminders,
} from '@/actions/reminders';

interface Reminder {
  id: string;
  type: 'rsvp_deadline' | 'payment_due' | 'task_deadline' | 'event_countdown' | 'vendor_followup' | 'guest_travel' | 'custom';
  title: string;
  message: string;
  scheduled_for: string;
  send_via: ('email' | 'whatsapp' | 'sms' | 'push')[];
  recipients: 'all_guests' | 'pending_rsvp' | 'confirmed_guests' | 'team' | 'specific';
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
}

interface ReminderStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  cancelled: number;
  byType: Record<string, number>;
}

interface Props {
  eventId: string;
  eventName: string;
  eventDate: string;
  reminders: Reminder[];
  upcomingReminders: Reminder[];
  stats: ReminderStats;
}

export function RemindersClient({
  eventId,
  eventName,
  eventDate,
  reminders,
  upcomingReminders,
  stats,
}: Props) {
  const router = useRouter();

  const handleCreateReminder = async (data: Partial<Reminder>) => {
    await createReminder(eventId, data as any);
    router.refresh();
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    await updateReminder(id, updates);
    router.refresh();
  };

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id);
    router.refresh();
  };

  const handleSendNow = async (id: string) => {
    await sendReminderNow(id);
    router.refresh();
  };

  const handleCancelReminder = async (id: string) => {
    await cancelReminder(id);
    router.refresh();
  };

  const handleCreateCountdownReminders = async () => {
    await createCountdownReminders(eventId, eventDate, eventName);
    router.refresh();
  };

  return (
    <ReminderDashboard
      eventId={eventId}
      eventName={eventName}
      eventDate={eventDate}
      reminders={reminders}
      upcomingReminders={upcomingReminders}
      stats={stats}
      onCreateReminder={handleCreateReminder}
      onUpdateReminder={handleUpdateReminder}
      onDeleteReminder={handleDeleteReminder}
      onSendNow={handleSendNow}
      onCancelReminder={handleCancelReminder}
      onCreateCountdownReminders={handleCreateCountdownReminders}
    />
  );
}
