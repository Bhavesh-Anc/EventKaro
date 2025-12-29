'use client';

import { Calendar, Users, IndianRupee, CheckCircle2 } from 'lucide-react';

interface Stats {
  daysToWedding: number;
  totalGuests: number;
  budgetUsed: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface Props {
  stats: Stats;
}

export function WeddingStatCards({ stats }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Days to Wedding */}
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Days to Wedding</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">{stats.daysToWedding}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900">
            <Calendar className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Total Guests */}
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Guests</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">{stats.totalGuests}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
            <Users className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Budget Used */}
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Budget Used</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">{stats.budgetUsed}%</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
            <IndianRupee className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Tasks Done */}
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tasks Done</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {stats.tasksCompleted}/{stats.totalTasks}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
