'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  assignee?: string;
}

interface Props {
  tasks: Task[];
  eventId?: string;
}

const PRIORITY_CONFIG = {
  high: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'High',
  },
  medium: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Medium',
  },
  low: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Low',
  },
};

export function WeddingTaskList({ tasks, eventId }: Props) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <Link
          href="/tasks"
          className="text-sm font-medium text-rose-700 hover:text-rose-800"
        >
          View All →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-sm text-gray-500">No tasks yet</p>
          <Link
            href="/tasks"
            className="mt-3 inline-block text-sm font-medium text-rose-700 hover:text-rose-800"
          >
            Create Task →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {incompleteTasks.slice(0, 5).map((task) => {
            const priorityConfig = PRIORITY_CONFIG[task.priority];
            const isOverdue = task.dueDate && new Date() > task.dueDate;

            return (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-rose-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button className="flex-shrink-0 mt-0.5">
                    <Circle className="h-5 w-5 text-gray-400 hover:text-rose-700" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      {task.dueDate && (
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {isOverdue && <AlertCircle className="inline h-3 w-3 mr-1" />}
                          Due {format(task.dueDate, 'MMM d')}
                        </span>
                      )}
                      {task.assignee && (
                        <span>Assigned to {task.assignee}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {completedCount > 0 && (
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{completedCount} task{completedCount !== 1 ? 's' : ''} completed</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
