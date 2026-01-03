'use client';

import { useState } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface CategoryData {
  category: string;
  label: string;
  planned: number;
  committed: number;
  paid: number;
  pending: number;
  color: string;
}

interface Props {
  categories: CategoryData[];
  totalBudget: number;
  totalCommitted: number;
  totalPaid: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  venue: '#E11D48', // rose-600
  catering: '#EA580C', // orange-600
  decorations: '#CA8A04', // yellow-600
  photography: '#16A34A', // green-600
  videography: '#0891B2', // cyan-600
  entertainment: '#7C3AED', // violet-600
  flowers: '#DB2777', // pink-600
  transportation: '#2563EB', // blue-600
  accommodation: '#4F46E5', // indigo-600
  invitations: '#9333EA', // purple-600
  gifts: '#DC2626', // red-600
  rentals: '#059669', // emerald-600
  staff: '#0284C7', // sky-600
  makeup: '#EC4899', // pink-500
  jewelry: '#F59E0B', // amber-500
  miscellaneous: '#6B7280', // gray-500
};

function formatAmount(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    venue: 'Venue',
    catering: 'Catering',
    decorations: 'Decorations',
    photography: 'Photography',
    videography: 'Videography',
    entertainment: 'Entertainment',
    flowers: 'Flowers',
    transportation: 'Transportation',
    accommodation: 'Accommodation',
    invitations: 'Invitations',
    gifts: 'Gifts',
    rentals: 'Rentals',
    staff: 'Staff',
    makeup: 'Makeup & Hair',
    jewelry: 'Jewelry',
    miscellaneous: 'Miscellaneous',
  };
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export function BudgetCharts({ categories, totalBudget, totalCommitted, totalPaid }: Props) {
  const [activeChart, setActiveChart] = useState<'pie' | 'bar'>('pie');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Calculate totals and percentages
  const totalPending = totalCommitted - totalPaid;
  const budgetUsedPercent = totalBudget > 0 ? (totalCommitted / totalBudget) * 100 : 0;
  const paidPercent = totalCommitted > 0 ? (totalPaid / totalCommitted) * 100 : 0;

  // Sort categories by committed amount
  const sortedCategories = [...categories].sort((a, b) => b.committed - a.committed);
  const topCategories = sortedCategories.slice(0, 6);
  const otherCategories = sortedCategories.slice(6);
  const otherTotal = otherCategories.reduce((sum, c) => sum + c.committed, 0);

  // Prepare pie chart data
  const pieData = [
    ...topCategories.map((c) => ({
      ...c,
      percentage: totalCommitted > 0 ? (c.committed / totalCommitted) * 100 : 0,
      color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.miscellaneous,
    })),
  ];

  if (otherTotal > 0) {
    pieData.push({
      category: 'other',
      label: 'Other',
      planned: otherCategories.reduce((sum, c) => sum + c.planned, 0),
      committed: otherTotal,
      paid: otherCategories.reduce((sum, c) => sum + c.paid, 0),
      pending: otherCategories.reduce((sum, c) => sum + c.pending, 0),
      percentage: (otherTotal / totalCommitted) * 100,
      color: '#9CA3AF',
    });
  }

  // Calculate pie chart angles
  let currentAngle = 0;
  const pieSlices = pieData.map((d) => {
    const angle = (d.percentage / 100) * 360;
    const slice = {
      ...d,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <IndianRupee className="h-4 w-4" />
            <span className="text-sm font-medium">Total Budget</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{formatAmount(totalBudget)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Committed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{formatAmount(totalCommitted)}</p>
          <p className="text-xs text-gray-500 mt-1">{budgetUsedPercent.toFixed(1)}% of budget</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{formatAmount(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">{paidPercent.toFixed(1)}% of committed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{formatAmount(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-1">{(100 - paidPercent).toFixed(1)}% remaining</p>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveChart('pie')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'pie'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChart className="h-4 w-4" />
          Distribution
        </button>
        <button
          onClick={() => setActiveChart('bar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'bar'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Comparison
        </button>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeChart === 'pie' ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="280" height="280" viewBox="0 0 280 280">
                  {pieSlices.map((slice, i) => {
                    const startRad = (slice.startAngle * Math.PI) / 180;
                    const endRad = (slice.endAngle * Math.PI) / 180;
                    const radius = 120;
                    const cx = 140;
                    const cy = 140;

                    const x1 = cx + radius * Math.cos(startRad);
                    const y1 = cy + radius * Math.sin(startRad);
                    const x2 = cx + radius * Math.cos(endRad);
                    const y2 = cy + radius * Math.sin(endRad);

                    const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

                    const pathD = `
                      M ${cx} ${cy}
                      L ${x1} ${y1}
                      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                      Z
                    `;

                    return (
                      <path
                        key={i}
                        d={pathD}
                        fill={slice.color}
                        stroke="white"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => setExpandedCategory(expandedCategory === slice.category ? null : slice.category)}
                      />
                    );
                  })}
                  {/* Center hole */}
                  <circle cx="140" cy="140" r="60" fill="white" />
                  <text x="140" y="135" textAnchor="middle" className="text-sm font-medium fill-gray-600">
                    Total
                  </text>
                  <text x="140" y="155" textAnchor="middle" className="text-lg font-bold fill-gray-900">
                    ₹{formatAmount(totalCommitted)}
                  </text>
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
              {pieData.map((item) => (
                <div
                  key={item.category}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    expandedCategory === item.category
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExpandedCategory(expandedCategory === item.category ? null : item.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{formatAmount(item.committed)}</p>
                      <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  {expandedCategory === item.category && (
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Planned</p>
                        <p className="font-medium">₹{formatAmount(item.planned)}</p>
                      </div>
                      <div>
                        <p className="text-green-600">Paid</p>
                        <p className="font-medium text-green-700">₹{formatAmount(item.paid)}</p>
                      </div>
                      <div>
                        <p className="text-amber-600">Pending</p>
                        <p className="font-medium text-amber-700">₹{formatAmount(item.pending)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Bar Chart */
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Planned vs Committed vs Paid</h4>
            <div className="space-y-3">
              {sortedCategories.map((cat) => {
                const plannedWidth = totalBudget > 0 ? (cat.planned / totalBudget) * 100 : 0;
                const committedWidth = totalBudget > 0 ? (cat.committed / totalBudget) * 100 : 0;
                const paidWidth = totalBudget > 0 ? (cat.paid / totalBudget) * 100 : 0;
                const isOverBudget = cat.committed > cat.planned;

                return (
                  <div key={cat.category} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.miscellaneous }}
                        />
                        <span className="text-sm font-medium text-gray-700">{getCategoryLabel(cat.category)}</span>
                        {isOverBudget && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Over Budget</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{formatAmount(cat.committed)} / ₹{formatAmount(cat.planned)}
                      </div>
                    </div>
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      {/* Planned bar (background) */}
                      <div
                        className="absolute inset-y-0 left-0 bg-gray-200 rounded-full"
                        style={{ width: `${Math.min(plannedWidth, 100)}%` }}
                      />
                      {/* Committed bar */}
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          isOverBudget ? 'bg-red-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(committedWidth, 100)}%` }}
                      />
                      {/* Paid bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                        style={{ width: `${Math.min(paidWidth, 100)}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-200 rounded-full" /> Planned
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-amber-400 rounded-full" /> Committed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" /> Paid
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Over Budget Alerts */}
      {categories.some((c) => c.committed > c.planned) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5" />
            Categories Over Budget
          </h4>
          <div className="space-y-2">
            {categories
              .filter((c) => c.committed > c.planned)
              .map((cat) => {
                const overAmount = cat.committed - cat.planned;
                const overPercent = cat.planned > 0 ? (overAmount / cat.planned) * 100 : 0;
                return (
                  <div key={cat.category} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <span className="font-medium text-gray-900">{getCategoryLabel(cat.category)}</span>
                    <div className="text-right">
                      <span className="text-red-600 font-semibold">+₹{formatAmount(overAmount)}</span>
                      <span className="text-xs text-gray-500 ml-2">({overPercent.toFixed(1)}% over)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
