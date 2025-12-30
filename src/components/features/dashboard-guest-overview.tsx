import Link from 'next/link';
import { Users, Hotel, Truck, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import {
  calculateConfirmationRate,
  type GuestStats,
  type OutstationStats,
  type VIPStats,
  type CostImpact,
  type GuestAlert,
} from '@/lib/guest-calculations';

interface Props {
  stats: GuestStats;
  outstation: OutstationStats;
  vip: VIPStats;
  costImpact: CostImpact;
  alerts: GuestAlert[];
  eventId?: string;
}

/**
 * DASHBOARD GUEST OVERVIEW
 *
 * Purpose: Risk radar for guest management
 * Answers: "Do I know exactly who is coming, what they cost, and what could still go wrong?"
 */
export function DashboardGuestOverview({
  stats,
  outstation,
  vip,
  costImpact,
  alerts,
  eventId,
}: Props) {
  const { rate: confirmationRate, color: rateColor } = calculateConfirmationRate(
    stats.confirmed,
    stats.total
  );

  const rateColorClasses = {
    green: 'text-green-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  if (stats.total === 0) {
    return (
      <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Guest Overview</h2>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Add guests to start tracking RSVPs, rooms, and costs
          </p>
          <Link
            href="/guests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all"
          >
            Add Guests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Guest Overview</h2>
        <Link
          href="/guests"
          className="text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors flex items-center gap-1"
        >
          Manage Guests
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Core Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Confirmation Rate */}
        <Link
          href="/guests?filter=pending"
          className="block p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Confirmation Rate</div>
          <div className={`text-3xl font-bold ${rateColorClasses[rateColor]} mb-1`}>
            {confirmationRate}%
          </div>
          <div className="text-xs text-gray-500">
            {stats.confirmed} / {stats.total} responded
          </div>
        </Link>

        {/* Metric 2: Pending Risk */}
        <Link
          href="/guests?filter=pending"
          className="block p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Pending Risk</div>
          <div className="text-3xl font-bold text-amber-700 mb-1">
            {stats.pending}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            guests pending
          </div>
        </Link>

        {/* Metric 3: Outstation Guests */}
        <Link
          href="/guests?view=logistics&filter=outstation"
          className="block p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Outstation</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {outstation.total}
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div className="flex items-center gap-1">
              <Hotel className="h-3 w-3" />
              Rooms: {outstation.roomsAssigned}/{outstation.total}
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Pickup: {outstation.pickupNeeded - outstation.pickupUnassigned}/{outstation.pickupNeeded}
            </div>
          </div>
        </Link>

        {/* Metric 4: VIP & Special Guests */}
        <Link
          href="/guests?filter=vip"
          className="block p-4 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">VIP & Special</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{vip.total}</div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Elderly: {vip.elderly}</div>
            <div>Children: {vip.children}</div>
          </div>
        </Link>
      </div>

      {/* Cost Awareness Card */}
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-bold text-amber-900 mb-3">
          Estimated Guest Cost Impact
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <div className="text-amber-700">Catering</div>
            <div className="font-semibold text-amber-900">
              ₹{costImpact.catering.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-amber-700">Rooms</div>
            <div className="font-semibold text-amber-900">
              ₹{costImpact.rooms.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-amber-700">Transport</div>
            <div className="font-semibold text-amber-900">
              ₹{costImpact.transport.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-amber-700 font-bold">Total</div>
            <div className="font-bold text-amber-900 text-lg">
              ₹{costImpact.total.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        {costImpact.pendingImpact > 0 && (
          <div className="pt-3 border-t border-amber-300 text-sm text-amber-800">
            <span className="font-semibold">
              +₹{costImpact.pendingImpact.toLocaleString('en-IN')}
            </span>{' '}
            if all pending guests attend
          </div>
        )}
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Requires Attention
          </h3>
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.link}
              className={`block p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                alert.severity === 'red'
                  ? 'border-red-200 bg-red-50 hover:border-red-300'
                  : 'border-amber-200 bg-amber-50 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  {alert.severity === 'red' ? (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        alert.severity === 'red' ? 'text-red-900' : 'text-amber-900'
                      }`}
                    >
                      {alert.message}
                    </div>
                    {alert.impact && (
                      <div
                        className={`text-xs mt-1 ${
                          alert.severity === 'red' ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        {alert.impact}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 ${
                    alert.severity === 'red' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
