'use client';

import { Users, UserCheck, UserX, Clock, HelpCircle, TrendingUp, Plane, Hotel } from 'lucide-react';

interface RSVPStats {
  totalFamilies: number;
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  maybeGuests: number;
  outstationGuests: number;
  needsHotel: number;
  needsPickup: number;
  rsvpResponseRate: number;
}

interface Props {
  stats: RSVPStats;
}

export function RSVPStatsCards({ stats }: Props) {
  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {/* Total Guests */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Guests</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalGuests}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.totalFamilies} families</div>
        </div>

        {/* Confirmed */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-700">Confirmed</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{stats.confirmedGuests}</div>
          <div className="text-xs text-green-700 mt-1">
            {stats.totalGuests > 0 ? Math.round((stats.confirmedGuests / stats.totalGuests) * 100) : 0}% of total
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-700">Pending</span>
          </div>
          <div className="text-3xl font-bold text-amber-900">{stats.pendingGuests}</div>
          <div className="text-xs text-amber-700 mt-1">awaiting response</div>
        </div>

        {/* Declined */}
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-700">Declined</span>
          </div>
          <div className="text-3xl font-bold text-red-900">{stats.declinedGuests}</div>
          <div className="text-xs text-red-700 mt-1">not attending</div>
        </div>

        {/* Maybe */}
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-700">Maybe</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{stats.maybeGuests}</div>
          <div className="text-xs text-blue-700 mt-1">undecided</div>
        </div>
      </div>

      {/* Response Rate & Logistics Row */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Response Rate Progress */}
        <div className="rounded-xl border-2 border-purple-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">RSVP Response Rate</span>
            </div>
            <span className="text-lg font-bold text-purple-700">{stats.rsvpResponseRate}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
              style={{ width: `${stats.rsvpResponseRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{stats.confirmedGuests + stats.declinedGuests + stats.maybeGuests} responded</span>
            <span>{stats.pendingGuests} pending</span>
          </div>
        </div>

        {/* Outstation / Hotel Needs */}
        <div className="rounded-xl border-2 border-rose-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Hotel className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium text-gray-700">Accommodation</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.outstationGuests}</div>
              <div className="text-xs text-gray-500">outstation guests</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-rose-700">{stats.needsHotel}</div>
              <div className="text-xs text-rose-600">need hotel</div>
            </div>
          </div>
        </div>

        {/* Transport Needs */}
        <div className="rounded-xl border-2 border-blue-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Transport</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{stats.needsPickup}</div>
              <div className="text-xs text-blue-600">need pickup</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">arrivals & departures</div>
              <div className="text-xs text-gray-400">tracked from RSVP forms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
