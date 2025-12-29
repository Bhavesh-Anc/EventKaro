'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

interface Props {
  stats: GuestStats;
  eventId?: string;
}

export function WeddingGuestOverview({ stats, eventId }: Props) {
  const confirmedPercentage = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;
  const pendingPercentage = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
  const declinedPercentage = stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Guest Overview</h3>
        <Link
          href={eventId ? `/events/${eventId}/guests` : '/guests'}
          className="text-sm font-medium text-rose-700 hover:text-rose-800"
        >
          Manage →
        </Link>
      </div>

      {/* Confirmation Rate Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Confirmation Rate</span>
          <span className="text-2xl font-bold text-gray-900">{confirmedPercentage}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden flex">
          {confirmedPercentage > 0 && (
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${confirmedPercentage}%` }}
            />
          )}
          {pendingPercentage > 0 && (
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
              style={{ width: `${pendingPercentage}%` }}
            />
          )}
          {declinedPercentage > 0 && (
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-500"
              style={{ width: `${declinedPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Guest Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-700">Confirmed</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{stats.confirmed}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-gray-700">Pending</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{stats.pending}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-gray-700">Declined</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{stats.declined}</span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Total Guests</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{stats.total}</span>
        </div>
      </div>
    </div>
  );
}
