'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Users } from 'lucide-react';
import type { BudgetSummary, CategoryBudget } from '@/lib/budget-calculations';
import { formatINR, formatFullINR } from '@/lib/budget-calculations';
import Link from 'next/link';

interface Props {
  summary: BudgetSummary;
  categories: CategoryBudget[];
  budgetEntries: any[];
  eventId: string;
  daysToEvent: number;
}

type ViewFilter = 'all' | 'over-budget' | 'pending-payments' | 'guest-linked';

/**
 * BUDGET TRACKER CLIENT
 *
 * Financial control room for event budget management
 * Category breakdown, vendor payments, risk awareness
 */
export function BudgetClient({
  summary,
  categories,
  budgetEntries,
  eventId,
  daysToEvent,
}: Props) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (viewFilter === 'over-budget') return cat.isOverBudget;
    if (viewFilter === 'pending-payments') return cat.pending > 0;
    if (viewFilter === 'guest-linked') {
      return ['catering', 'transportation', 'accommodation'].includes(cat.category);
    }
    return true;
  });

  // Calculate percentages for stacked bar
  const committedPercent = (summary.committed / summary.totalBudget) * 100;
  const paidPercent = (summary.paid / summary.totalBudget) * 100;
  const pendingPercent = (summary.pending / summary.totalBudget) * 100;

  const healthConfig = {
    'on-track': { text: 'On Track', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'at-risk': { text: 'At Risk', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    'over-budget': { text: 'Over Budget', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  };

  const health = healthConfig[summary.health];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-600 mt-1">
            Real-time financial control • {daysToEvent} days to event
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/budget/settings"
            className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            Set Total Budget
          </Link>
        </div>
      </div>

      {/* Budget Summary Bar (ALWAYS VISIBLE) */}
      <div className={`sticky top-0 z-10 rounded-xl border-2 ${health.borderColor} ${health.bgColor} p-6 shadow-lg`}>
        {/* Total Budget & Health */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Budget</div>
            <div className="text-4xl font-bold text-gray-900">{formatINR(summary.totalBudget)}</div>
          </div>
          <div className={`px-4 py-2 rounded-full border-2 ${health.borderColor} ${health.bgColor}`}>
            <div className={`text-lg font-bold ${health.color}`}>{health.text}</div>
          </div>
        </div>

        {/* Stacked Bar */}
        <div className="h-10 rounded-lg overflow-hidden flex bg-gray-100 mb-4">
          {paidPercent > 0 && (
            <div
              className="bg-green-500 hover:bg-green-600 transition-colors relative group flex items-center justify-center"
              style={{ width: `${Math.min(paidPercent, 100)}%` }}
            >
              <span className="text-xs text-white font-semibold">
                Paid {Math.round(paidPercent)}%
              </span>
            </div>
          )}
          {pendingPercent > 0 && (
            <div
              className="bg-amber-500 hover:bg-amber-600 transition-colors relative group flex items-center justify-center"
              style={{ width: `${Math.min(pendingPercent, 100 - paidPercent)}%` }}
            >
              <span className="text-xs text-white font-semibold">
                Pending {Math.round(pendingPercent)}%
              </span>
            </div>
          )}
          {summary.overrun > 0 && (
            <div
              className="bg-red-500 hover:bg-red-600 transition-colors relative group flex items-center justify-center"
              style={{ width: `${Math.min((summary.overrun / summary.totalBudget) * 100, 100)}%` }}
            >
              <span className="text-xs text-white font-semibold">Overrun</span>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Planned</div>
            <div className="text-xl font-bold text-gray-900">{formatINR(summary.planned)}</div>
          </div>
          <div>
            <div className="text-gray-600">Committed</div>
            <div className="text-xl font-bold text-blue-700">{formatINR(summary.committed)}</div>
          </div>
          <div>
            <div className="text-gray-600">Paid</div>
            <div className="text-xl font-bold text-green-700">{formatINR(summary.paid)}</div>
          </div>
          <div>
            <div className="text-gray-600">Pending</div>
            <div className="text-xl font-bold text-amber-700">{formatINR(summary.pending)}</div>
          </div>
        </div>

        {summary.overrun > 0 && (
          <div className="mt-4 pt-4 border-t border-red-300 flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">
              Budget exceeded by {formatFullINR(summary.overrun)}
            </span>
          </div>
        )}
      </div>

      {/* View Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setViewFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewFilter === 'all'
              ? 'bg-rose-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        <button
          onClick={() => setViewFilter('over-budget')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewFilter === 'over-budget'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Over Budget
        </button>
        <button
          onClick={() => setViewFilter('pending-payments')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewFilter === 'pending-payments'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Payments
        </button>
        <button
          onClick={() => setViewFilter('guest-linked')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewFilter === 'guest-linked'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Guest-Linked Costs
        </button>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Budget by Category ({filteredCategories.length})
        </h2>

        {filteredCategories.length === 0 && (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories match this filter
            </h3>
            <p className="text-gray-600">Try a different view or add budget entries</p>
          </div>
        )}

        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          const categoryEntries = budgetEntries.filter((e: any) => e.category === category.category);
          const utilizationPercent = category.planned > 0 ? (category.committed / category.planned) * 100 : 0;

          return (
            <div
              key={category.category}
              className={`rounded-xl border-2 bg-white shadow-sm ${
                category.isOverBudget ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              {/* Category Header (Clickable) */}
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {category.category.replace(/_/g, ' ')}
                      </h3>
                      {category.isOverBudget && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          OVER BUDGET
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">
                        Planned: {formatINR(category.planned)}
                      </span>
                      <span className={`font-semibold ${category.isOverBudget ? 'text-red-700' : 'text-gray-900'}`}>
                        Committed: {formatINR(category.committed)}
                      </span>
                      <span className="text-green-700 font-semibold">
                        Paid: {formatINR(category.paid)}
                      </span>
                      <span className="text-amber-700 font-semibold">
                        Pending: {formatINR(category.pending)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {category.delta !== 0 && (
                      <div className={`flex items-center gap-1 text-sm font-bold ${
                        category.delta > 0 ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {category.delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {category.delta > 0 ? '+' : ''}{formatINR(Math.abs(category.delta))}
                      </div>
                    )}
                    <div className={`text-2xl font-bold ${category.isOverBudget ? 'text-red-700' : 'text-gray-900'}`}>
                      {Math.round(utilizationPercent)}%
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      category.isOverBudget
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  />
                </div>
              </button>

              {/* Category Detail (Expandable) */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 pt-4 space-y-4">
                  {/* Vendor Entries */}
                  {categoryEntries.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Budget Entries ({categoryEntries.length})
                      </h4>
                      {categoryEntries.map((entry: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {entry.vendors?.business_name || entry.subcategory || 'Unnamed Entry'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {entry.wedding_events?.event_name || 'Event'}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Committed</div>
                              <div className="font-bold text-gray-900">
                                {formatFullINR(entry.committed_amount_inr || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Paid</div>
                              <div className="font-bold text-green-700">
                                {formatFullINR(entry.paid_amount_inr || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Pending</div>
                              <div className="font-bold text-amber-700">
                                {formatFullINR(entry.pending_amount_inr || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No budget entries for this category yet
                    </div>
                  )}

                  {/* Guest-Driven Cost Hint */}
                  {['catering', 'transportation', 'accommodation'].includes(category.category) && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center gap-2 text-sm text-blue-900">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">
                          Guest-driven category - cost scales with guest count
                        </span>
                      </div>
                      <Link
                        href="/guests"
                        className="text-sm text-blue-700 hover:text-blue-900 font-semibold mt-1 inline-block"
                      >
                        Manage Guests →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No budget entries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your wedding expenses by adding budget entries
          </p>
        </div>
      )}
    </div>
  );
}
