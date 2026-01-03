'use client';

import {
  Users,
  IndianRupee,
  CheckCircle2,
  Calendar,
  UserPlus,
  Clock,
  MessageSquare,
  Hotel,
  Truck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

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

interface Props {
  activities: ActivityItem[];
  maxItems?: number;
}

const activityConfig = {
  rsvp_confirmed: {
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  rsvp_declined: {
    icon: Users,
    color: 'text-red-600',
    bg: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  payment_made: {
    icon: IndianRupee,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  task_completed: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  guest_added: {
    icon: UserPlus,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  vendor_booked: {
    icon: Calendar,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    borderColor: 'border-rose-200',
  },
  hotel_assigned: {
    icon: Hotel,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
  },
  transport_assigned: {
    icon: Truck,
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
  event_added: {
    icon: Calendar,
    color: 'text-pink-600',
    bg: 'bg-pink-100',
    borderColor: 'border-pink-200',
  },
};

export function ActivityFeed({ activities, maxItems = 10 }: Props) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {displayedActivities.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Activity will appear here as you manage your wedding
            </p>
          </div>
        ) : (
          displayedActivities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors relative"
              >
                {/* Timeline connector */}
                {index < displayedActivities.length - 1 && (
                  <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0 z-10`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > maxItems && (
        <div className="p-3 border-t bg-gray-50 text-center">
          <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to generate sample activities from app data
export function generateRecentActivities(data: {
  recentRSVPs: { name: string; status: 'accepted' | 'declined'; timestamp: Date }[];
  recentPayments: { vendor: string; amount: number; timestamp: Date }[];
  recentTasks: { title: string; timestamp: Date }[];
  recentGuests: { name: string; familyName: string; timestamp: Date }[];
}): ActivityItem[] {
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
