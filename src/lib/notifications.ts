// Shared notification utilities - can be used by both server and client components

export interface Notification {
  id: string;
  type: 'rsvp' | 'payment' | 'task' | 'reminder' | 'alert' | 'logistics';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationData {
  pendingRSVPs: number;
  newRSVPsToday: number;
  overduePayments: { vendor: string; amount: number }[];
  upcomingTasks: { title: string; dueDate: Date }[];
  daysToWedding: number;
  guestsNeedingHotel: number;
  guestsNeedingPickup: number;
}

// Helper function to generate notifications from app data
export function generateNotifications(data: NotificationData): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // RSVP notifications
  if (data.newRSVPsToday > 0) {
    notifications.push({
      id: 'rsvp-today',
      type: 'rsvp',
      title: `${data.newRSVPsToday} New RSVP Response${data.newRSVPsToday > 1 ? 's' : ''}`,
      message: `You received ${data.newRSVPsToday} new RSVP response${data.newRSVPsToday > 1 ? 's' : ''} today. Check your guest list for details.`,
      timestamp: now,
      read: false,
      priority: 'medium',
    });
  }

  if (data.pendingRSVPs > 20 && data.daysToWedding < 30) {
    notifications.push({
      id: 'rsvp-pending',
      type: 'alert',
      title: 'Many RSVPs Still Pending',
      message: `${data.pendingRSVPs} guests haven't responded yet. Consider sending reminders.`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'high',
    });
  }

  // Payment notifications
  data.overduePayments.forEach((payment, i) => {
    notifications.push({
      id: `payment-${i}`,
      type: 'payment',
      title: 'Payment Due',
      message: `Payment of Rs. ${(payment.amount / 100).toLocaleString()} to ${payment.vendor} is due.`,
      timestamp: new Date(now.getTime() - (i + 1) * 60 * 60 * 1000),
      read: false,
      priority: 'high',
    });
  });

  // Task reminders
  data.upcomingTasks.slice(0, 3).forEach((task, i) => {
    notifications.push({
      id: `task-${i}`,
      type: 'task',
      title: 'Task Reminder',
      message: `"${task.title}" is due ${formatDate(task.dueDate)}.`,
      timestamp: new Date(now.getTime() - (i + 3) * 60 * 60 * 1000),
      read: i > 0,
      priority: 'medium',
    });
  });

  // Logistics notifications
  if (data.guestsNeedingHotel > 0) {
    notifications.push({
      id: 'logistics-hotel',
      type: 'logistics',
      title: 'Hotel Assignments Needed',
      message: `${data.guestsNeedingHotel} outstation guests need hotel arrangements.`,
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      read: false,
      priority: data.daysToWedding < 14 ? 'high' : 'medium',
    });
  }

  if (data.guestsNeedingPickup > 0) {
    notifications.push({
      id: 'logistics-pickup',
      type: 'logistics',
      title: 'Transport Assignments Needed',
      message: `${data.guestsNeedingPickup} guests need pickup arrangements.`,
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      read: false,
      priority: data.daysToWedding < 7 ? 'high' : 'medium',
    });
  }

  // Wedding countdown reminder
  if (data.daysToWedding <= 7 && data.daysToWedding > 0) {
    notifications.push({
      id: 'countdown',
      type: 'reminder',
      title: `${data.daysToWedding} Days to Go!`,
      message: `Your wedding is in ${data.daysToWedding} day${data.daysToWedding !== 1 ? 's' : ''}. Make sure everything is ready!`,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      read: false,
      priority: 'medium',
    });
  }

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Simple date formatter to avoid date-fns dependency in shared code
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
