import Link from 'next/link';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import type { BudgetSummary, CostDriver, BudgetAlert } from '@/lib/budget-calculations';
import { formatINR, formatFullINR } from '@/lib/budget-calculations';

interface Props {
  summary: BudgetSummary;
  costDrivers: CostDriver[];
  alerts: BudgetAlert[];
  guestCostPerUnit: number; // Per 10 guests
  vendorsPaid: number;
  vendorsPending: number;
  totalPendingAmount: number;
  eventId?: string;
}

/**
 * DASHBOARD BUDGET SNAPSHOT
 *
 * Financial situational awareness widget
 * Answers: "Are we in control of the money — and what could still go wrong?"
 */
export function DashboardBudgetSnapshot({
  summary,
  costDrivers,
  alerts,
  guestCostPerUnit,
  vendorsPaid,
  vendorsPending,
  totalPendingAmount,
  eventId,
}: Props) {
  const healthConfig = {
    'on-track': {
      icon: CheckCircle2,
      text: 'On Track',
      color: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600',
    },
    'at-risk': {
      icon: AlertTriangle,
      text: 'At Risk',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
    'over-budget': {
      icon: AlertTriangle,
      text: 'Over Budget',
      color: 'bg-red-100 text-red-800 border-red-200',
      iconColor: 'text-red-600',
    },
  };

  const healthBadge = healthConfig[summary.health];
  const HealthIcon = healthBadge.icon;

  // Calculate percentages for stacked bar
  const plannedPercent = (summary.planned / summary.totalBudget) * 100;
  const committedPercent = (summary.committed / summary.totalBudget) * 100;
  const paidPercent = (summary.paid / summary.totalBudget) * 100;
  const pendingPercent = (summary.pending / summary.totalBudget) * 100;

  return (
    <div className="rounded-xl border-2 border-rose-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Budget Snapshot</h2>
          <p className="text-xs text-gray-600 mt-0.5">Updated in real time</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${healthBadge.color}`}>
          <HealthIcon className={`h-4 w-4 ${healthBadge.iconColor}`} />
          <span className="text-sm font-bold">{healthBadge.text}</span>
        </div>
      </div>

      {/* Total Budget */}
      <div className="text-center py-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Total Budget</div>
        <div className="text-3xl font-bold text-gray-900">{formatINR(summary.totalBudget)}</div>
      </div>

      {/* Budget Breakdown - Stacked Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Budget Breakdown</span>
          <Link href="/budget" className="text-rose-700 hover:text-rose-900 font-semibold">
            View Details →
          </Link>
        </div>

        {/* Stacked Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex bg-gray-100">
          {paidPercent > 0 && (
            <div
              className="bg-green-500 hover:bg-green-600 transition-colors relative group"
              style={{ width: `${Math.min(paidPercent, 100)}%` }}
              title={`Paid: ${formatFullINR(summary.paid)}`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold opacity-0 group-hover:opacity-100">
                {Math.round(paidPercent)}%
              </span>
            </div>
          )}
          {pendingPercent > 0 && (
            <div
              className="bg-amber-500 hover:bg-amber-600 transition-colors relative group"
              style={{ width: `${Math.min(pendingPercent, 100 - paidPercent)}%` }}
              title={`Pending: ${formatFullINR(summary.pending)}`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold opacity-0 group-hover:opacity-100">
                {Math.round(pendingPercent)}%
              </span>
            </div>
          )}
          {summary.overrun > 0 && (
            <div
              className="bg-red-500 hover:bg-red-600 transition-colors relative group"
              style={{ width: `${Math.min((summary.overrun / summary.totalBudget) * 100, 100)}%` }}
              title={`Overrun: ${formatFullINR(summary.overrun)}`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold opacity-0 group-hover:opacity-100">
                Overrun
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <Link href="/budget?view=committed" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Committed</span>
            </div>
            <span className="font-semibold text-gray-900">{formatINR(summary.committed)}</span>
          </Link>
          <Link href="/budget?view=paid" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">Paid</span>
            </div>
            <span className="font-semibold text-gray-900">{formatINR(summary.paid)}</span>
          </Link>
          <Link href="/budget?view=pending" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">Pending</span>
            </div>
            <span className="font-semibold text-gray-900">{formatINR(summary.pending)}</span>
          </Link>
          {summary.overrun > 0 && (
            <div className="flex items-center justify-between p-2 rounded bg-red-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">Overrun</span>
              </div>
              <span className="font-semibold text-red-900">{formatINR(summary.overrun)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cost Drivers */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Top Cost Drivers</h3>
        <div className="space-y-2">
          {costDrivers.map((driver, idx) => (
            <Link
              key={idx}
              href={`/budget?category=${driver.name.toLowerCase()}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 capitalize">
                  {driver.name.replace(/_/g, ' ')}
                </div>
                <div className="text-xs text-gray-600">
                  {formatINR(driver.planned)} → {formatINR(driver.current)}
                </div>
              </div>
              {driver.delta !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  driver.delta > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {driver.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {driver.delta > 0 ? '+' : ''}{formatINR(Math.abs(driver.delta))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Guest-Driven Cost Awareness */}
      {guestCostPerUnit > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-700" />
            <div className="text-sm font-bold text-blue-900">Guest Impact</div>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatFullINR(guestCostPerUnit)} <span className="text-sm font-normal">per 10 guests</span>
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Includes catering + transport + accommodation
          </div>
        </div>
      )}

      {/* Vendor Payment Status */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-gray-700" />
          <div className="text-sm font-bold text-gray-900">Vendor Payments</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-600">Fully paid</div>
            <div className="text-lg font-bold text-green-700">{vendorsPaid}</div>
          </div>
          <div>
            <div className="text-gray-600">Pending payment</div>
            <div className="text-lg font-bold text-amber-700">{vendorsPending}</div>
          </div>
        </div>
        {totalPendingAmount > 0 && (
          <Link
            href="/budget?view=pending-payments"
            className="mt-2 block text-center text-xs font-semibold text-rose-700 hover:text-rose-900"
          >
            {formatFullINR(totalPendingAmount)} pending →
          </Link>
        )}
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.link}
              className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${
                alert.severity === 'red'
                  ? 'border-red-200 bg-red-50 hover:bg-red-100'
                  : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                alert.severity === 'red' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${
                  alert.severity === 'red' ? 'text-red-900' : 'text-amber-900'
                }`}>
                  {alert.message}
                </div>
                {alert.impact && (
                  <div className={`text-xs mt-0.5 ${
                    alert.severity === 'red' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {alert.impact}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
