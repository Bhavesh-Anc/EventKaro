'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Get all tasks for an event
 */
export async function getEventTasks(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(id, full_name)
    `)
    .eq('event_id', eventId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data;
}

/**
 * Get tasks for organization (fallback if event_id not set)
 */
export async function getOrganizationTasks(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching organization tasks:', error);
    return [];
  }

  return data;
}

/**
 * Create a new task
 */
export async function createTask(
  eventId: string,
  task: {
    title: string;
    description?: string;
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
    assignedTo?: string;
    assignedToName?: string;
    weddingEventId?: string;
    vendorId?: string;
  }
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get organization from event
  const { data: event } = await supabase
    .from('events')
    .select('organization_id')
    .eq('id', eventId)
    .single();

  if (!event) {
    return { error: 'Event not found' };
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      event_id: eventId,
      organization_id: event.organization_id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority || 'medium',
      due_date: task.dueDate,
      assigned_to: task.assignedTo,
      assigned_to_name: task.assignedToName,
      wedding_event_id: task.weddingEventId,
      vendor_id: task.vendorId,
      completed: false,
    });

  if (error) {
    console.error('Error creating task:', error);
    return { error: error.message };
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Update task
 */
export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
    assignedTo?: string;
    assignedToName?: string;
  }
) {
  const supabase = await createClient();

  const updateData: any = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category) updateData.category = updates.category;
  if (updates.priority) updateData.priority = updates.priority;
  if (updates.dueDate) updateData.due_date = updates.dueDate;
  if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
  if (updates.assignedToName) updateData.assigned_to_name = updates.assignedToName;

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', error);
    return { error: error.message };
  }

  revalidatePath('/tasks');
  return { success: true };
}

/**
 * Mark task as complete/incomplete
 */
export async function toggleTaskComplete(taskId: string) {
  const supabase = await createClient();

  // Get current status
  const { data: task } = await supabase
    .from('tasks')
    .select('completed')
    .eq('id', taskId)
    .single();

  if (!task) {
    return { error: 'Task not found' };
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error toggling task:', error);
    return { error: error.message };
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { success: true, completed: !task.completed };
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return { error: error.message };
  }

  revalidatePath('/tasks');
  return { success: true };
}

/**
 * Get task templates for wedding
 */
export async function getWeddingTaskTemplates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('template_name', 'indian_wedding')
    .eq('is_active', true)
    .order('days_before_wedding', { ascending: false });

  if (error) {
    console.error('Error fetching task templates:', error);
    return [];
  }

  return data;
}

/**
 * Generate tasks from templates based on wedding date
 */
export async function generateTasksFromTemplates(eventId: string, weddingDate: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get event's organization
  const { data: event } = await supabase
    .from('events')
    .select('organization_id')
    .eq('id', eventId)
    .single();

  if (!event) {
    return { error: 'Event not found' };
  }

  // Get templates
  const templates = await getWeddingTaskTemplates();
  if (templates.length === 0) {
    return { error: 'No templates found' };
  }

  // Calculate due dates based on wedding date
  const wedding = new Date(weddingDate);
  const tasks = templates.map(template => {
    const dueDate = new Date(wedding);
    dueDate.setDate(dueDate.getDate() - template.days_before_wedding);

    return {
      event_id: eventId,
      organization_id: event.organization_id,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      due_date: dueDate.toISOString().split('T')[0],
      completed: false,
    };
  });

  const { error } = await supabase
    .from('tasks')
    .insert(tasks);

  if (error) {
    console.error('Error generating tasks:', error);
    return { error: error.message };
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { success: true, count: tasks.length };
}

/**
 * Get task statistics for dashboard
 */
export async function getTaskStats(eventId: string) {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from('tasks')
    .select('completed, priority, due_date, category')
    .eq('event_id', eventId);

  if (!tasks) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      highPriority: 0,
      dueThisWeek: 0,
      byCategory: {},
    };
  }

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today).length,
    highPriority: tasks.filter(t => !t.completed && t.priority === 'high').length,
    dueThisWeek: tasks.filter(t => {
      if (t.completed || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    }).length,
    byCategory: {} as Record<string, { total: number; completed: number }>,
  };

  // Group by category
  tasks.forEach(task => {
    const category = task.category || 'general';
    if (!stats.byCategory[category]) {
      stats.byCategory[category] = { total: 0, completed: 0 };
    }
    stats.byCategory[category].total++;
    if (task.completed) {
      stats.byCategory[category].completed++;
    }
  });

  return stats;
}

/**
 * Get upcoming tasks for dashboard widget
 */
export async function getUpcomingTasks(eventId: string, limit: number = 5) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', eventId)
    .eq('completed', false)
    .gte('due_date', today)
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming tasks:', error);
    return [];
  }

  return data;
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(eventId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', eventId)
    .eq('completed', false)
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue tasks:', error);
    return [];
  }

  return data;
}
