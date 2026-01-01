'use client';

import { useState } from 'react';
import { format, parseISO, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Store,
  Users,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface TimelineVendorBooking {
  id: string;
  vendor_name: string;
  vendor_category: string;
  event_name?: string;
  booking_date?: string;
  payment_due_date?: string;
  amount_pending?: number;
  status: 'confirmed' | 'pending' | 'paid';
}

export interface TimelineEvent {
  id: string;
  event_name: string;
  custom_event_name?: string;
  start_datetime: string;
  end_datetime: string;
  venue_name?: string;
  expected_guest_count?: number;
  status: 'ready' | 'attention' | 'conflict';
}

interface UnifiedTimelineItem {
  id: string;
  type: 'event' | 'task' | 'vendor';
  date: string;
  title: string;
  subtitle?: string;
  status?: string;
  priority?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  data: TimelineEvent | TimelineTask | TimelineVendorBooking;
}

interface Props {
  events: TimelineEvent[];
  tasks: TimelineTask[];
  vendorBookings: TimelineVendorBooking[];
  parentEventId: string;
}

type FilterType = 'all' | 'events' | 'tasks' | 'vendors';

export function UnifiedTimeline({ events, tasks, vendorBookings, parentEventId }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Convert all items to unified format
  const unifiedItems: UnifiedTimelineItem[] = [];

  // Add events
  events.forEach(event => {
    unifiedItems.push({
      id: `event-${event.id}`,
      type: 'event',
      date: event.start_datetime,
      title: event.custom_event_name || event.event_name,
      subtitle: event.venue_name || 'Venue TBD',
      status: event.status,
      icon: Calendar,
      color: event.status === 'ready' ? 'bg-green-100 text-green-700' : event.status === 'attention' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700',
      data: event,
    });
  });

  // Add tasks
  tasks.forEach(task => {
    if (!showCompleted && task.completed) return;
    unifiedItems.push({
      id: `task-${task.id}`,
      type: 'task',
      date: task.due_date,
      title: task.title,
      subtitle: task.category || 'General',
      status: task.completed ? 'completed' : isPast(parseISO(task.due_date)) ? 'overdue' : 'pending',
      priority: task.priority,
      icon: task.completed ? CheckCircle2 : Circle,
      color: task.completed ? 'bg-green-100 text-green-700' : task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
      data: task,
    });
  });

  // Add vendor payment dates
  vendorBookings.forEach(booking => {
    if (booking.payment_due_date) {
      unifiedItems.push({
        id: `vendor-${booking.id}`,
        type: 'vendor',
        date: booking.payment_due_date,
        title: `Payment: ${booking.vendor_name}`,
        subtitle: `${booking.vendor_category} • Rs. ${((booking.amount_pending || 0) / 100).toLocaleString()}`,
        status: booking.status,
        icon: Store,
        color: booking.status === 'paid' ? 'bg-green-100 text-green-700' : isPast(parseISO(booking.payment_due_date)) ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700',
        data: booking,
      });
    }
  });

  // Filter items
  const filteredItems = unifiedItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'events') return item.type === 'event';
    if (filter === 'tasks') return item.type === 'task';
    if (filter === 'vendors') return item.type === 'vendor';
    return true;
  });

  // Sort by date
  const sortedItems = filteredItems.sort((a, b) =>
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  // Group by date
  const itemsByDate = sortedItems.reduce((acc, item) => {
    const date = format(parseISO(item.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, UnifiedTimelineItem[]>);

  const dates = Object.keys(itemsByDate).sort();

  // Split into past and upcoming
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingDates = dates.filter(d => d >= today);
  const pastDates = dates.filter(d => d < today).reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          {(['all', 'events', 'tasks', 'vendors'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' ? 'All' : f === 'events' ? 'Events' : f === 'tasks' ? 'Tasks' : 'Vendors'}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          />
          Show completed
        </label>

        <div className="ml-auto text-sm text-gray-500">
          {sortedItems.length} items
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-purple-600" />
          <span className="text-gray-600">Vendor Payments</span>
        </div>
      </div>

      {/* Upcoming Items */}
      {upcomingDates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-600" />
            Upcoming
          </h3>
          {upcomingDates.map(date => (
            <DateGroup
              key={date}
              date={date}
              items={itemsByDate[date]}
              parentEventId={parentEventId}
            />
          ))}
        </div>
      )}

      {/* Past Items (collapsed by default) */}
      {pastDates.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              <span className="text-sm font-medium">Past items ({pastDates.length} days)</span>
            </div>
          </summary>
          <div className="mt-4 space-y-4 opacity-60">
            {pastDates.map(date => (
              <DateGroup
                key={date}
                date={date}
                items={itemsByDate[date]}
                parentEventId={parentEventId}
                isPast
              />
            ))}
          </div>
        </details>
      )}

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items to show</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Add events, tasks, or vendor bookings to see them here'
              : `No ${filter} found`}
          </p>
          {filter === 'events' && (
            <Link
              href={`/events/${parentEventId}/setup-timeline`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800"
            >
              Add Events
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function DateGroup({
  date,
  items,
  parentEventId,
  isPast = false,
}: {
  date: string;
  items: UnifiedTimelineItem[];
  parentEventId: string;
  isPast?: boolean;
}) {
  const dateObj = parseISO(date);
  const isTodayDate = isToday(dateObj);

  return (
    <div className="relative">
      {/* Date Header */}
      <div
        className={`sticky top-0 z-10 flex items-center gap-3 mb-3 pb-2 border-b ${
          isTodayDate
            ? 'bg-rose-50 border-rose-300'
            : isPast
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-gray-200'
        }`}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
            isTodayDate
              ? 'bg-rose-600 text-white'
              : isPast
              ? 'bg-gray-300 text-gray-600'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {format(dateObj, 'd')}
        </div>
        <div>
          <div className="font-bold text-gray-900">
            {format(dateObj, 'EEEE, MMM d')}
          </div>
          {isTodayDate && (
            <span className="text-sm text-rose-700 font-semibold">Today</span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 pl-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                isPast
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-rose-200 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600">{item.subtitle}</p>
                    )}
                  </div>
                  {item.type === 'task' && item.status === 'overdue' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue
                    </span>
                  )}
                  {item.type === 'event' && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.status === 'ready' ? 'bg-green-100 text-green-700' :
                      item.status === 'attention' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'ready' ? 'Ready' : item.status === 'attention' ? 'Needs Attention' : 'Conflict'}
                    </span>
                  )}
                </div>
                {item.type === 'event' && item.data && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO((item.data as TimelineEvent).start_datetime), 'h:mm a')}
                    </span>
                    {(item.data as TimelineEvent).expected_guest_count && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(item.data as TimelineEvent).expected_guest_count} guests
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
