'use client';

import { TrendingUp, TrendingDown, Minus, Users, CheckCircle2, IndianRupee, Calendar } from 'lucide-react';

interface TrendData {
  current: number;
  previous: number;
  label: string;
}

interface WeeklyStats {
  guestsConfirmed: TrendData;
  tasksCompleted: TrendData;
  budgetSpent: TrendData;
  rsvpResponses: TrendData;
}

interface Props {
  stats: WeeklyStats;
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const percentage = previous > 0 ? Math.round((diff / previous) * 100) : current > 0 ? 100 : 0;

  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-semibold">+{percentage}%</span>
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-gray-500">
      <Minus className="h-4 w-4" />
      <span className="text-sm font-semibold">0%</span>
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const height = 40;

  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-2 rounded-t ${color}`}
          style={{ height: `${(value / max) * height}px`, minHeight: '4px' }}
        />
      ))}
    </div>
  );
}

export function DashboardTrends({ stats }: Props) {
  // Mock weekly data for charts (would come from database in production)
  const guestChartData = [3, 5, 2, 8, 12, 7, stats.guestsConfirmed.current];
  const taskChartData = [2, 4, 3, 5, 4, 6, stats.tasksCompleted.current];
  const rsvpChartData = [1, 3, 2, 4, 6, 5, stats.rsvpResponses.current];

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">This Week's Progress</h3>
        <span className="text-sm text-gray-500">vs. last week</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Guests Confirmed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">Guests Confirmed</span>
            </div>
            <TrendIndicator current={stats.guestsConfirmed.current} previous={stats.guestsConfirmed.previous} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">+{stats.guestsConfirmed.current}</span>
            <MiniChart data={guestChartData} color="bg-green-500" />
          </div>
          <p className="text-xs text-gray-500">
            {stats.guestsConfirmed.previous} confirmed last week
          </p>
        </div>

        {/* Tasks Completed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">Tasks Done</span>
            </div>
            <TrendIndicator current={stats.tasksCompleted.current} previous={stats.tasksCompleted.previous} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">+{stats.tasksCompleted.current}</span>
            <MiniChart data={taskChartData} color="bg-blue-500" />
          </div>
          <p className="text-xs text-gray-500">
            {stats.tasksCompleted.previous} completed last week
          </p>
        </div>

        {/* RSVP Responses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">RSVP Responses</span>
            </div>
            <TrendIndicator current={stats.rsvpResponses.current} previous={stats.rsvpResponses.previous} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">+{stats.rsvpResponses.current}</span>
            <MiniChart data={rsvpChartData} color="bg-purple-500" />
          </div>
          <p className="text-xs text-gray-500">
            {stats.rsvpResponses.previous} responses last week
          </p>
        </div>

        {/* Budget Spent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IndianRupee className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">Budget Spent</span>
            </div>
            <TrendIndicator current={stats.budgetSpent.current} previous={stats.budgetSpent.previous} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {stats.budgetSpent.current > 100000
                ? `${(stats.budgetSpent.current / 100000).toFixed(1)}L`
                : `${(stats.budgetSpent.current / 1000).toFixed(0)}K`}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {stats.budgetSpent.previous > 100000
              ? `${(stats.budgetSpent.previous / 100000).toFixed(1)}L`
              : `${(stats.budgetSpent.previous / 1000).toFixed(0)}K`} spent last week
          </p>
        </div>
      </div>
    </div>
  );
}
