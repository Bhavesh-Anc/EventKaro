'use client';

import Link from 'next/link';
import { IndianRupee } from 'lucide-react';

interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface Props {
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  eventId?: string;
}

export function WeddingBudgetTracker({ categories, totalBudget, totalSpent, eventId }: Props) {
  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalSpent;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Tracker</h3>
        <Link
          href="/budget"
          className="text-sm font-medium text-rose-700 hover:text-rose-800"
        >
          View Details →
        </Link>
      </div>

      {/* Budget Summary */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Budget</span>
          <span className="text-xl font-bold text-gray-900">₹{totalBudget.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Spent</span>
          <span className="text-xl font-bold text-rose-700">₹{totalSpent.toLocaleString('en-IN')}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all"
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{percentageUsed}% used</span>
          <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(remaining).toLocaleString('en-IN')} {remaining >= 0 ? 'remaining' : 'over budget'}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">By Category</h4>
        {categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No budget categories yet</p>
          </div>
        ) : (
          categories.map((category, index) => {
            const categoryPercentage = category.budget > 0
              ? Math.round((category.spent / category.budget) * 100)
              : 0;
            const isOverBudget = category.spent > category.budget;

            return (
              <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-rose-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    ₹{category.spent.toLocaleString('en-IN')} / ₹{category.budget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : `bg-gradient-to-r ${category.color}`
                    }`}
                    style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
