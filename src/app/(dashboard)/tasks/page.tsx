import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { getCurrentWedding } from '@/actions/events';
import { getEventTasks, getTaskStats, generateTasksFromTemplates } from '@/actions/tasks';
import { redirect } from 'next/navigation';
import { TasksClient } from '@/components/features/tasks-client';

export default async function TasksPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const wedding = await getCurrentWedding();

  // Fetch real tasks if we have a wedding
  let tasks: any[] = [];
  let stats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
    dueThisWeek: 0,
    byCategory: {},
  };

  if (wedding) {
    tasks = await getEventTasks(wedding.id);
    stats = await getTaskStats(wedding.id);
  }

  return (
    <TasksClient
      tasks={tasks}
      stats={stats}
      eventId={wedding?.id}
      weddingDate={wedding?.date}
      hasWedding={!!wedding}
    />
  );
}
