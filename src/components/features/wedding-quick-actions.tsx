'use client';

import Link from 'next/link';
import { UserPlus, Store, Calendar, MessageSquare, IndianRupee, ListTodo } from 'lucide-react';

interface Props {
  eventId?: string;
}

export function WeddingQuickActions({ eventId }: Props) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Add Guest */}
        <Link
          href={eventId ? `/events/${eventId}/guests` : '/guests'}
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <UserPlus className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            Add Guest
          </span>
        </Link>

        {/* Book Vendor */}
        <Link
          href="/vendors"
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <Store className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            Book Vendor
          </span>
        </Link>

        {/* Add Event */}
        <Link
          href={eventId ? `/events/${eventId}/wedding-timeline/new` : '/events/new'}
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <Calendar className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            Add Event
          </span>
        </Link>

        {/* Send Message */}
        <button className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <MessageSquare className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            Send Message
          </span>
        </button>

        {/* Add Expense */}
        <Link
          href="/budget"
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <IndianRupee className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            Add Expense
          </span>
        </Link>

        {/* New Task */}
        <Link
          href="/tasks"
          className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-4 hover:border-rose-700 hover:bg-rose-50 transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-rose-100">
            <ListTodo className="h-6 w-6 text-gray-600 group-hover:text-rose-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-rose-900 text-center">
            New Task
          </span>
        </Link>
      </div>
    </div>
  );
}
