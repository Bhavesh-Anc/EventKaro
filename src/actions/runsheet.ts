'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface RunsheetItem {
  id: string;
  event_id: string;
  time: string;
  end_time?: string;
  title: string;
  description?: string;
  location?: string;
  assigned_to?: string[];
  category: 'ceremony' | 'ritual' | 'photo' | 'food' | 'entertainment' | 'logistics' | 'transition' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  notes?: string;
  is_important?: boolean;
  actual_start_time?: string;
  actual_end_time?: string;
  delay_minutes?: number;
}

/**
 * Get all runsheet items for an event
 */
export async function getEventRunsheet(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('runsheet_items')
    .select('*')
    .eq('event_id', eventId)
    .order('time');

  if (error) {
    console.error('Error fetching runsheet:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    time: item.time,
    endTime: item.end_time,
    title: item.title,
    description: item.description,
    location: item.location,
    assignedTo: item.assigned_to,
    category: item.category,
    status: item.status,
    notes: item.notes,
    isImportant: item.is_important,
    actualStartTime: item.actual_start_time,
    actualEndTime: item.actual_end_time,
    delayMinutes: item.delay_minutes,
  }));
}

/**
 * Add a runsheet item
 */
export async function addRunsheetItem(
  eventId: string,
  item: {
    time: string;
    endTime?: string;
    title: string;
    description?: string;
    location?: string;
    assignedTo?: string[];
    category: 'ceremony' | 'ritual' | 'photo' | 'food' | 'entertainment' | 'logistics' | 'transition' | 'other';
    isImportant?: boolean;
    status?: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('runsheet_items')
    .insert({
      event_id: eventId,
      time: item.time,
      end_time: item.endTime,
      title: item.title,
      description: item.description,
      location: item.location,
      assigned_to: item.assignedTo,
      category: item.category,
      is_important: item.isImportant || false,
      status: item.status || 'pending',
    });

  if (error) {
    console.error('Error adding runsheet item:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Update runsheet item status
 */
export async function updateRunsheetItemStatus(
  itemId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped'
) {
  const supabase = await createClient();

  const updates: Record<string, any> = { status };

  // Record actual start time when status changes to in_progress
  if (status === 'in_progress') {
    updates.actual_start_time = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Record actual end time when status changes to completed
  if (status === 'completed') {
    updates.actual_end_time = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const { error } = await supabase
    .from('runsheet_items')
    .update(updates)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating runsheet item status:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Update a runsheet item
 */
export async function updateRunsheetItem(
  itemId: string,
  updates: Partial<{
    time: string;
    endTime: string;
    title: string;
    description: string;
    location: string;
    assignedTo: string[];
    category: 'ceremony' | 'ritual' | 'photo' | 'food' | 'entertainment' | 'logistics' | 'transition' | 'other';
    isImportant: boolean;
    notes: string;
    delayMinutes: number;
  }>
) {
  const supabase = await createClient();

  const dbUpdates: Record<string, any> = {};
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.isImportant !== undefined) dbUpdates.is_important = updates.isImportant;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.delayMinutes !== undefined) dbUpdates.delay_minutes = updates.delayMinutes;

  const { error } = await supabase
    .from('runsheet_items')
    .update(dbUpdates)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating runsheet item:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Delete a runsheet item
 */
export async function deleteRunsheetItem(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('runsheet_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting runsheet item:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}
