import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

export default async function BudgetPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  // Placeholder data - TODO: Implement real budget tracking
  const totalBudget = 2500000;
  const totalSpent = 1650000;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = Math.round((totalSpent / totalBudget) * 100);

  const categories = [
    {
      name: 'Venue',
      budget: 800000,
      spent: 750000,
      color: 'from-purple-500 to-purple-600',
      items: [
        { name: 'Main Wedding Hall', amount: 500000, date: '2024-12-15', status: 'paid' },
        { name: 'Decoration Setup', amount: 250000, date: '2024-12-20', status: 'paid' },
      ],
    },
    {
      name: 'Catering',
      budget: 600000,
      spent: 450000,
      color: 'from-blue-500 to-blue-600',
      items: [
        { name: 'Advance Payment', amount: 300000, date: '2024-12-10', status: 'paid' },
        { name: 'Menu Tasting', amount: 50000, date: '2024-12-12', status: 'paid' },
        { name: 'Final Payment', amount: 100000, date: '2025-02-15', status: 'pending' },
      ],
    },
    {
      name: 'Photography',
      budget: 250000,
      spent: 200000,
      color: 'from-green-500 to-green-600',
      items: [
        { name: 'Booking Advance', amount: 100000, date: '2024-11-20', status: 'paid' },
        { name: 'Pre-wedding Shoot', amount: 100000, date: '2025-01-10', status: 'paid' },
      ],
    },
    {
      name: 'Decoration',
      budget: 300000,
      spent: 150000,
      color: 'from-pink-500 to-pink-600',
      items: [
        { name: 'Flower Advance', amount: 100000, date: '2024-12-18', status: 'paid' },
        { name: 'Stage Setup', amount: 50000, date: '2024-12-20', status: 'paid' },
      ],
    },
    {
      name: 'Entertainment',
      budget: 200000,
      spent: 100000,
      color: 'from-amber-500 to-amber-600',
      items: [{ name: 'DJ Booking', amount: 100000, date: '2024-12-05', status: 'paid' }],
    },
    {
      name: 'Miscellaneous',
      budget: 350000,
      spent: 0,
      color: 'from-gray-500 to-gray-600',
      items: [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-600 mt-1">Manage your wedding expenses</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Budget Overview */}
      <div className="rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900">₹{totalBudget.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-rose-700">₹{totalSpent.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600 mt-1">{percentageUsed}% of budget</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Remaining</p>
            <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(remaining).toLocaleString('en-IN')}
            </p>
            {remaining < 0 && <p className="text-sm text-red-600 mt-1">Over budget!</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-4 w-full rounded-full bg-white overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Budget by Category</h2>

        {categories.map((category) => {
          const categoryPercentage = category.budget > 0
            ? Math.round((category.spent / category.budget) * 100)
            : 0;
          const isOverBudget = category.spent > category.budget;
          const categoryRemaining = category.budget - category.spent;

          return (
            <div key={category.name} className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-600">
                      Budget: ₹{category.budget.toLocaleString('en-IN')}
                    </span>
                    <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      Spent: ₹{category.spent.toLocaleString('en-IN')}
                    </span>
                    <span className={`flex items-center gap-1 ${categoryRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {categoryRemaining >= 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      ₹{Math.abs(categoryRemaining).toLocaleString('en-IN')} {categoryRemaining >= 0 ? 'left' : 'over'}
                    </span>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                  {categoryPercentage}%
                </span>
              </div>

              {/* Category Progress Bar */}
              <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden mb-4">
                <div
                  className={`h-full transition-all ${
                    isOverBudget
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : `bg-gradient-to-r ${category.color}`
                  }`}
                  style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                />
              </div>

              {/* Items List */}
              {category.items.length > 0 && (
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {category.items.length === 0 && (
                <p className="text-center text-gray-500 py-4">No expenses recorded yet</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
