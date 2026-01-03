'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Users,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Truck,
  Hotel,
  Clock,
  Check,
  Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

interface Props {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
}

const iconMap = {
  rsvp: { icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
  payment: { icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-100' },
  task: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
  reminder: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
  alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  logistics: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onDismiss
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-lg"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We'll notify you about important updates
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const { icon: Icon, color, bg } = iconMap[notification.type];

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-rose-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              {notification.priority === 'high' && (
                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </span>
                              <div className="flex gap-2">
                                {!notification.read && onMarkAsRead && (
                                  <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Mark read
                                  </button>
                                )}
                                {onDismiss && (
                                  <button
                                    onClick={() => onDismiss(notification.id)}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to generate notifications from app data
export function generateNotifications(data: {
  pendingRSVPs: number;
  newRSVPsToday: number;
  overduePayments: { vendor: string; amount: number }[];
  upcomingTasks: { title: string; dueDate: Date }[];
  daysToWedding: number;
  guestsNeedingHotel: number;
  guestsNeedingPickup: number;
}): Notification[] {
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
      message: `"${task.title}" is due ${format(task.dueDate, 'MMM d')}.`,
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
