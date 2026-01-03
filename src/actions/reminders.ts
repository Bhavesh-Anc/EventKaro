'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface Reminder {
  id: string;
  event_id: string;
  type: 'rsvp_deadline' | 'payment_due' | 'task_deadline' | 'event_countdown' | 'vendor_followup' | 'guest_travel' | 'custom';
  title: string;
  message: string;
  scheduled_for: string;
  send_via: ('email' | 'whatsapp' | 'sms' | 'push')[];
  recipients: 'all_guests' | 'pending_rsvp' | 'confirmed_guests' | 'team' | 'specific';
  recipient_ids?: string[];
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  created_at: string;
  reference_id?: string; // For linking to tasks, payments, etc.
  reference_type?: string;
}

export interface ReminderTemplate {
  id: string;
  type: Reminder['type'];
  name: string;
  title_template: string;
  message_template: string;
  default_days_before: number;
}

/**
 * Get all reminders for an event
 */
export async function getEventReminders(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('event_id', eventId)
    .order('scheduled_for', { ascending: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get upcoming reminders (next 7 days)
 */
export async function getUpcomingReminders(eventId: string) {
  const supabase = await createClient();

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', now.toISOString())
    .lte('scheduled_for', weekFromNow.toISOString())
    .order('scheduled_for', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming reminders:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a reminder
 */
export async function createReminder(
  eventId: string,
  reminderData: {
    type: Reminder['type'];
    title: string;
    message: string;
    scheduled_for: string;
    send_via: ('email' | 'whatsapp' | 'sms' | 'push')[];
    recipients: Reminder['recipients'];
    recipient_ids?: string[];
    reference_id?: string;
    reference_type?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('reminders')
    .insert({
      event_id: eventId,
      ...reminderData,
      status: 'scheduled',
    });

  if (error) {
    console.error('Error creating reminder:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/reminders`);
  return { success: true };
}

/**
 * Create RSVP deadline reminder
 */
export async function createRSVPDeadlineReminder(
  eventId: string,
  deadline: string,
  daysBefore: number = 3
) {
  const deadlineDate = new Date(deadline);
  const reminderDate = new Date(deadlineDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);

  return createReminder(eventId, {
    type: 'rsvp_deadline',
    title: 'RSVP Reminder',
    message: `Please confirm your attendance by ${new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. We'd love to have you celebrate with us!`,
    scheduled_for: reminderDate.toISOString(),
    send_via: ['email', 'whatsapp'],
    recipients: 'pending_rsvp',
  });
}

/**
 * Create payment due reminder
 */
export async function createPaymentDueReminder(
  eventId: string,
  paymentId: string,
  vendorName: string,
  amount: number,
  dueDate: string,
  daysBefore: number = 3
) {
  const dueDateObj = new Date(dueDate);
  const reminderDate = new Date(dueDateObj.getTime() - daysBefore * 24 * 60 * 60 * 1000);

  return createReminder(eventId, {
    type: 'payment_due',
    title: `Payment Due: ${vendorName}`,
    message: `Reminder: Payment of ₹${(amount / 100).toLocaleString('en-IN')} is due to ${vendorName} on ${dueDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`,
    scheduled_for: reminderDate.toISOString(),
    send_via: ['email', 'push'],
    recipients: 'team',
    reference_id: paymentId,
    reference_type: 'payment',
  });
}

/**
 * Create event countdown reminders
 */
export async function createCountdownReminders(eventId: string, eventDate: string, eventName: string) {
  const eventDateObj = new Date(eventDate);
  const reminders = [];

  // 30 days before
  const thirtyDays = new Date(eventDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (thirtyDays > new Date()) {
    reminders.push({
      type: 'event_countdown' as const,
      title: '30 Days to Go!',
      message: `Just 30 days until ${eventName}! Make sure all arrangements are in place.`,
      scheduled_for: thirtyDays.toISOString(),
      send_via: ['email', 'push'] as ('email' | 'push')[],
      recipients: 'team' as const,
    });
  }

  // 7 days before
  const sevenDays = new Date(eventDateObj.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (sevenDays > new Date()) {
    reminders.push({
      type: 'event_countdown' as const,
      title: '1 Week to Go!',
      message: `${eventName} is just a week away! Time for final preparations.`,
      scheduled_for: sevenDays.toISOString(),
      send_via: ['email', 'whatsapp', 'push'] as ('email' | 'whatsapp' | 'push')[],
      recipients: 'team' as const,
    });
  }

  // 1 day before
  const oneDay = new Date(eventDateObj.getTime() - 1 * 24 * 60 * 60 * 1000);
  if (oneDay > new Date()) {
    reminders.push({
      type: 'event_countdown' as const,
      title: 'Tomorrow is the Big Day!',
      message: `${eventName} is tomorrow! Wishing you all the best.`,
      scheduled_for: oneDay.toISOString(),
      send_via: ['email', 'whatsapp', 'push'] as ('email' | 'whatsapp' | 'push')[],
      recipients: 'confirmed_guests' as const,
    });
  }

  const supabase = await createClient();

  for (const reminder of reminders) {
    await supabase.from('reminders').insert({
      event_id: eventId,
      ...reminder,
      status: 'scheduled',
    });
  }

  revalidatePath(`/events/${eventId}/reminders`);
  return { success: true, count: reminders.length };
}

/**
 * Create guest travel reminder
 */
export async function createGuestTravelReminder(
  eventId: string,
  guestId: string,
  guestName: string,
  travelDate: string,
  pickupDetails: string
) {
  const travelDateObj = new Date(travelDate);
  // Send reminder 2 days before travel
  const reminderDate = new Date(travelDateObj.getTime() - 2 * 24 * 60 * 60 * 1000);

  return createReminder(eventId, {
    type: 'guest_travel',
    title: 'Travel Reminder',
    message: `Dear ${guestName}, your travel is scheduled for ${travelDateObj.toLocaleDateString('en-IN')}. ${pickupDetails}`,
    scheduled_for: reminderDate.toISOString(),
    send_via: ['whatsapp', 'email'],
    recipients: 'specific',
    recipient_ids: [guestId],
    reference_id: guestId,
    reference_type: 'guest_travel',
  });
}

/**
 * Update reminder
 */
export async function updateReminder(
  reminderId: string,
  updates: Partial<{
    title: string;
    message: string;
    scheduled_for: string;
    send_via: ('email' | 'whatsapp' | 'sms' | 'push')[];
    status: Reminder['status'];
  }>
) {
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from('reminders')
    .select('event_id')
    .eq('id', reminderId)
    .single();

  const { error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', reminderId);

  if (error) {
    return { error: error.message };
  }

  if (reminder) {
    revalidatePath(`/events/${reminder.event_id}/reminders`);
  }
  return { success: true };
}

/**
 * Cancel a reminder
 */
export async function cancelReminder(reminderId: string) {
  return updateReminder(reminderId, { status: 'cancelled' });
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string) {
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from('reminders')
    .select('event_id')
    .eq('id', reminderId)
    .single();

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);

  if (error) {
    return { error: error.message };
  }

  if (reminder) {
    revalidatePath(`/events/${reminder.event_id}/reminders`);
  }
  return { success: true };
}

/**
 * Send a reminder immediately (manual trigger)
 */
export async function sendReminderNow(reminderId: string) {
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from('reminders')
    .select('*')
    .eq('id', reminderId)
    .single();

  if (!reminder) {
    return { error: 'Reminder not found' };
  }

  // TODO: Implement actual sending logic via email/whatsapp/sms
  // For now, just mark as sent

  const { error } = await supabase
    .from('reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', reminderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${reminder.event_id}/reminders`);
  return { success: true };
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reminders')
    .select('status, type')
    .eq('event_id', eventId);

  if (error) {
    return {
      total: 0,
      scheduled: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
      byType: {},
    };
  }

  const reminders = data || [];
  const stats = {
    total: reminders.length,
    scheduled: reminders.filter(r => r.status === 'scheduled').length,
    sent: reminders.filter(r => r.status === 'sent').length,
    failed: reminders.filter(r => r.status === 'failed').length,
    cancelled: reminders.filter(r => r.status === 'cancelled').length,
    byType: {} as Record<string, number>,
  };

  reminders.forEach(r => {
    stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
  });

  return stats;
}

/**
 * Get reminder templates
 */
export async function getReminderTemplates(): Promise<ReminderTemplate[]> {
  return [
    {
      id: 'rsvp-1',
      type: 'rsvp_deadline',
      name: 'RSVP Reminder',
      title_template: 'RSVP Reminder - {event_name}',
      message_template: 'Dear {guest_name}, please confirm your attendance for {event_name} by {deadline}. We would be honored to have you celebrate with us!',
      default_days_before: 3,
    },
    {
      id: 'payment-1',
      type: 'payment_due',
      name: 'Payment Due Reminder',
      title_template: 'Payment Due: {vendor_name}',
      message_template: 'Reminder: Payment of ₹{amount} is due to {vendor_name} on {due_date}. Please ensure timely payment.',
      default_days_before: 3,
    },
    {
      id: 'countdown-7',
      type: 'event_countdown',
      name: '7 Day Countdown',
      title_template: '7 Days to {event_name}!',
      message_template: '{event_name} is just a week away! We hope you\'re as excited as we are. See you soon!',
      default_days_before: 7,
    },
    {
      id: 'countdown-1',
      type: 'event_countdown',
      name: '1 Day Countdown',
      title_template: 'Tomorrow is {event_name}!',
      message_template: 'The big day is tomorrow! {event_name} will begin at {event_time} at {venue}. We can\'t wait to see you!',
      default_days_before: 1,
    },
    {
      id: 'travel-1',
      type: 'guest_travel',
      name: 'Travel Reminder',
      title_template: 'Travel Reminder for {event_name}',
      message_template: 'Dear {guest_name}, your travel for {event_name} is scheduled for {travel_date}. Pickup: {pickup_details}. Safe travels!',
      default_days_before: 2,
    },
  ];
}
