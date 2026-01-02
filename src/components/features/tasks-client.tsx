'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Circle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Sparkles,
  X,
  Clock,
  Tag,
  Loader2,
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { createTask, toggleTaskComplete, deleteTask, generateTasksFromTemplates } from '@/actions/tasks';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  assigned_to_name?: string;
  completed: boolean;
  completed_at?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
  dueThisWeek: number;
  byCategory: Record<string, { total: number; completed: number }>;
}

interface TasksClientProps {
  tasks: Task[];
  stats: TaskStats;
  eventId?: string;
  weddingDate?: string;
  hasWedding: boolean;
}

const PRIORITY_CONFIG = {
  high: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'High' },
  medium: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Medium' },
  low: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Low' },
};

const CATEGORIES = [
  'venue', 'catering', 'photography', 'decoration', 'entertainment',
  'beauty', 'attire', 'invitations', 'accommodation', 'transportation',
  'payments', 'planning', 'general'
];

export function TasksClient({ tasks, stats, eventId, weddingDate, hasWedding }: TasksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddTask, setShowAddTask] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'planning',
    assignedToName: '',
  });

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const overdueTasks = incompleteTasks.filter(t => t.due_date && isPast(new Date(t.due_date)));

  const filteredTasks = () => {
    switch (filter) {
      case 'completed':
        return completedTasks;
      case 'overdue':
        return overdueTasks;
      case 'pending':
        return incompleteTasks;
      default:
        return tasks;
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    startTransition(async () => {
      await toggleTaskComplete(taskId);
      router.refresh();
    });
  };

  const handleCreateTask = async () => {
    if (!eventId || !newTask.title.trim()) return;

    startTransition(async () => {
      await createTask(eventId, {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        category: newTask.category,
        assignedToName: newTask.assignedToName,
      });
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: 'planning',
        assignedToName: '',
      });
      router.refresh();
    });
  };

  const handleGenerateFromTemplates = async () => {
    if (!eventId || !weddingDate) return;

    setIsGenerating(true);
    const result = await generateTasksFromTemplates(eventId, weddingDate);
    setIsGenerating(false);

    if (result.success) {
      router.refresh();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    startTransition(async () => {
      await deleteTask(taskId);
      router.refresh();
    });
  };

  if (!hasWedding) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Wedding Event</h2>
        <p className="text-gray-600 mb-6">Create a wedding event to start managing tasks</p>
        <a
          href="/events/new/wedding"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950"
        >
          Create Wedding
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your wedding tasks</p>
        </div>
        <div className="flex gap-3">
          {tasks.length === 0 && (
            <button
              onClick={handleGenerateFromTemplates}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg border-2 border-rose-200 text-rose-700 font-medium hover:bg-rose-50 flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              Generate from Templates
            </button>
          )}
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">High Priority</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.highPriority}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Overdue</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="rounded-xl bg-red-50 border-2 border-red-500 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mt-1">These tasks need immediate attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['pending', 'all', 'overdue', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 font-medium border-b-2 transition-colors capitalize",
              filter === tab
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
            {tab === 'overdue' && stats.overdue > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                {stats.overdue}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="p-6 space-y-3">
          {filteredTasks().length === 0 ? (
            <div className="text-center py-12">
              {filter === 'completed' ? (
                <>
                  <Circle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No completed tasks yet</p>
                </>
              ) : filter === 'overdue' ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No overdue tasks! 🎉</p>
                </>
              ) : (
                <>
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No tasks yet</p>
                  <button
                    onClick={handleGenerateFromTemplates}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-lg bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 inline-flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Wedding Checklist
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredTasks().map(task => {
              const isOverdue = task.due_date && !task.completed && isPast(new Date(task.due_date));
              const daysUntil = task.due_date ? differenceInDays(new Date(task.due_date), new Date()) : null;
              const priorityConfig = PRIORITY_CONFIG[task.priority];

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                    task.completed && "opacity-60 bg-gray-50 border-gray-200",
                    !task.completed && isOverdue && "border-red-300 bg-red-50",
                    !task.completed && !isOverdue && "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      disabled={isPending}
                      className="flex-shrink-0 mt-1"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-rose-700" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className={cn(
                            "font-semibold text-gray-900",
                            task.completed && "line-through"
                          )}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
                              priorityConfig.bgColor,
                              priorityConfig.color
                            )}
                          >
                            {priorityConfig.label}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span className={cn(isOverdue && "text-red-600 font-medium")}>
                              {isOverdue && '⚠️ '}
                              {format(new Date(task.due_date), 'MMM d, yyyy')}
                              {daysUntil !== null && !task.completed && (
                                <span className="ml-1 text-gray-500">
                                  ({daysUntil === 0 ? 'Today' : daysUntil > 0 ? `${daysUntil}d left` : `${Math.abs(daysUntil)}d ago`})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {task.assigned_to_name && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{task.assigned_to_name}</span>
                          </div>
                        )}
                        {task.category && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs capitalize">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
              <button
                onClick={() => setShowAddTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Add more details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 capitalize"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={newTask.assignedToName}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedToName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim() || isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
