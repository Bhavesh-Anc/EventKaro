// Shared activity utilities - can be used by both server and client components

export interface ActivityItem {
  id: string;
  type: 'rsvp_confirmed' | 'rsvp_declined' | 'payment_made' | 'task_completed' | 'guest_added' | 'vendor_booked' | 'hotel_assigned' | 'transport_assigned' | 'event_added';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    guestName?: string;
    familyName?: string;
    vendorName?: string;
    amount?: number;
    taskTitle?: string;
  };
}

export interface RecentActivitiesData {
  recentRSVPs: { name: string; status: 'accepted' | 'declined'; timestamp: Date }[];
  recentPayments: { vendor: string; amount: number; timestamp: Date }[];
  recentTasks: { title: string; timestamp: Date }[];
  recentGuests: { name: string; familyName: string; timestamp: Date }[];
}

// Helper to generate activities from app data
export function generateRecentActivities(data: RecentActivitiesData): ActivityItem[] {
  const activities: ActivityItem[] = [];

  // Add RSVP activities
  data.recentRSVPs.forEach((rsvp, i) => {
    activities.push({
      id: `rsvp-${i}`,
      type: rsvp.status === 'accepted' ? 'rsvp_confirmed' : 'rsvp_declined',
      title: rsvp.status === 'accepted' ? 'RSVP Confirmed' : 'RSVP Declined',
      description: `${rsvp.name} ${rsvp.status === 'accepted' ? 'confirmed attendance' : 'declined the invitation'}`,
      timestamp: rsvp.timestamp,
      metadata: { guestName: rsvp.name },
    });
  });

  // Add payment activities
  data.recentPayments.forEach((payment, i) => {
    activities.push({
      id: `payment-${i}`,
      type: 'payment_made',
      title: 'Payment Made',
      description: `Paid Rs. ${(payment.amount / 100).toLocaleString()} to ${payment.vendor}`,
      timestamp: payment.timestamp,
      metadata: { vendorName: payment.vendor, amount: payment.amount },
    });
  });

  // Add task activities
  data.recentTasks.forEach((task, i) => {
    activities.push({
      id: `task-${i}`,
      type: 'task_completed',
      title: 'Task Completed',
      description: `Completed "${task.title}"`,
      timestamp: task.timestamp,
      metadata: { taskTitle: task.title },
    });
  });

  // Add guest activities
  data.recentGuests.forEach((guest, i) => {
    activities.push({
      id: `guest-${i}`,
      type: 'guest_added',
      title: 'Guest Added',
      description: `Added ${guest.name} to ${guest.familyName} family`,
      timestamp: guest.timestamp,
      metadata: { guestName: guest.name, familyName: guest.familyName },
    });
  });

  // Sort by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
