import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { Plus, Circle, CheckCircle2, AlertCircle, Calendar, User } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default async function TasksPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  // Placeholder data - TODO: Implement real task management
  const tasks = [
    {
      id: '1',
      title: 'Finalize menu with caterer',
      description: 'Review and approve final menu selections for all events',
      dueDate: addDays(new Date(), 2),
      priority: 'high' as const,
      category: 'Catering',
      assignee: 'You',
      completed: false,
    },
    {
      id: '2',
      title: 'Book makeup artist',
      description: 'Confirm booking for bridal makeup and styling',
      dueDate: addDays(new Date(), 5),
      priority: 'high' as const,
      category: 'Beauty',
      assignee: 'Sarah',
      completed: false,
    },
    {
      id: '3',
      title: 'Send digital invitations',
      description: 'Send e-invites to all confirmed guests',
      dueDate: addDays(new Date(), 1),
      priority: 'high' as const,
      category: 'Invitations',
      assignee: 'You',
      completed: false,
    },
    {
      id: '4',
      title: 'Confirm hotel room blocks',
      description: 'Finalize room allocations for out-of-town guests',
      dueDate: addDays(new Date(), 7),
      priority: 'medium' as const,
      category: 'Accommodation',
      assignee: 'John',
      completed: false,
    },
    {
      id: '5',
      title: 'Order wedding favors',
      description: 'Place order for 350 wedding favor boxes',
      dueDate: addDays(new Date(), 10),
      priority: 'medium' as const,
      category: 'Decor',
      assignee: 'You',
      completed: false,
    },
    {
      id: '6',
      title: 'Finalize seating chart',
      description: 'Complete seating arrangements for reception',
      dueDate: addDays(new Date(), 15),
      priority: 'low' as const,
      category: 'Planning',
      assignee: 'Sarah',
      completed: false,
    },
    {
      id: '7',
      title: 'Book transportation',
      description: 'Arrange buses for guest transportation',
      dueDate: addDays(new Date(), 20),
      priority: 'medium' as const,
      category: 'Logistics',
      assignee: 'John',
      completed: false,
    },
    {
      id: '8',
      title: 'Confirm photographer timeline',
      description: 'Finalize photography schedule for all events',
      dueDate: addDays(new Date(), -2),
      priority: 'high' as const,
      category: 'Photography',
      assignee: 'You',
      completed: true,
    },
  ];

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = incompleteTasks.filter((t) => new Date() > t.dueDate);
  const highPriorityTasks = incompleteTasks.filter((t) => t.priority === 'high');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your wedding tasks</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tasks.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-amber-600">{incompleteTasks.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">High Priority</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{highPriorityTasks.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Overdue</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{overdueTasks.length}</p>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="rounded-xl bg-red-50 border-2 border-red-500 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mt-1">These tasks need immediate attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Task Categories */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Tasks ({incompleteTasks.length})
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {incompleteTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">All tasks completed! 🎉</p>
              </div>
            ) : (
              incompleteTasks.map((task) => {
                const isOverdue = new Date() > task.dueDate;
                const priorityConfig = PRIORITY_CONFIG[task.priority];

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button className="flex-shrink-0 mt-1">
                        <Circle className="h-6 w-6 text-gray-400 hover:text-rose-700" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                          <span
                            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {isOverdue && '⚠️ '}Due {format(task.dueDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{task.assignee}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Completed Tasks ({completedTasks.length})
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-through">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex gap-4 text-sm text-gray-600 mt-2">
                        <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
