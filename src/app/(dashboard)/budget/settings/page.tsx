'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, IndianRupee, Save, AlertCircle } from 'lucide-react';

export default function BudgetSettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [totalBudget, setTotalBudget] = useState('4200000'); // Default ₹42L
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Preset budget options in INR
  const presets = [
    { label: '₹10 Lakh', value: '1000000' },
    { label: '₹25 Lakh', value: '2500000' },
    { label: '₹42 Lakh', value: '4200000' },
    { label: '₹75 Lakh', value: '7500000' },
    { label: '₹1 Crore', value: '10000000' },
    { label: '₹2 Crore', value: '20000000' },
  ];

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    const budgetValue = parseInt(totalBudget);
    if (isNaN(budgetValue) || budgetValue < 100000) {
      setError('Please enter a valid budget (minimum ₹1 Lakh)');
      return;
    }

    startTransition(async () => {
      // For now, we'll store this in localStorage as a simple solution
      // In production, this would be saved to the database
      localStorage.setItem('wedding_total_budget', totalBudget);
      setSuccess(true);
      setTimeout(() => {
        router.push('/budget');
        router.refresh();
      }, 1000);
    });
  };

  const formatDisplay = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return '₹0';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Crore`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/budget"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Budget Tracker
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Budget Settings</h1>
        <p className="text-gray-600 mt-1">Set your total wedding budget</p>
      </div>

      {/* Budget Input Card */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900">
            <IndianRupee className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Total Wedding Budget</h2>
            <p className="text-sm text-gray-600">This is your overall budget limit</p>
          </div>
        </div>

        {/* Current Display */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Current Budget</div>
          <div className="text-3xl font-bold text-gray-900">{formatDisplay(totalBudget)}</div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Enter Budget Amount (in Rupees)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              min="100000"
              step="100000"
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              placeholder="4200000"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Quick Select
          </label>
          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setTotalBudget(preset.value)}
                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  totalBudget === preset.value
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 hover:border-gray-400 text-gray-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <span className="text-sm text-green-800 font-semibold">
              ✓ Budget saved successfully! Redirecting...
            </span>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          {isPending ? 'Saving...' : 'Save Budget'}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">How Budget Tracking Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your total budget is the limit you've set for the wedding</li>
            <li>• Planned amounts are your initial estimates per category</li>
            <li>• Committed amounts are what you've agreed with vendors</li>
            <li>• Paid amounts are what you've actually paid</li>
            <li>• The tracker will alert you when you're approaching limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
