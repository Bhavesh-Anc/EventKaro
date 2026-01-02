'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface EmergencyContact {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  role: string;
  category: 'medical' | 'security' | 'family' | 'vendor' | 'emergency_services' | 'transport' | 'other';
  is_primary?: boolean;
  notes?: string;
  available_24x7?: boolean;
  created_at: string;
}

/**
 * Get all emergency contacts for an event
 */
export async function getEventEmergencyContacts(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('event_id', eventId)
    .order('is_primary', { ascending: false })
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching emergency contacts:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    role: c.role,
    category: c.category,
    isPrimary: c.is_primary,
    notes: c.notes,
    available24x7: c.available_24x7,
  }));
}

/**
 * Add an emergency contact
 */
export async function addEmergencyContact(
  eventId: string,
  contact: {
    name: string;
    phone: string;
    role: string;
    category: 'medical' | 'security' | 'family' | 'vendor' | 'emergency_services' | 'transport' | 'other';
    isPrimary?: boolean;
    notes?: string;
    available24x7?: boolean;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('emergency_contacts')
    .insert({
      event_id: eventId,
      name: contact.name,
      phone: contact.phone,
      role: contact.role,
      category: contact.category,
      is_primary: contact.isPrimary || false,
      notes: contact.notes,
      available_24x7: contact.available24x7 || false,
    });

  if (error) {
    console.error('Error adding emergency contact:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(
  contactId: string,
  updates: Partial<{
    name: string;
    phone: string;
    role: string;
    category: 'medical' | 'security' | 'family' | 'vendor' | 'emergency_services' | 'transport' | 'other';
    isPrimary: boolean;
    notes: string;
    available24x7: boolean;
  }>
) {
  const supabase = await createClient();

  // Convert camelCase to snake_case for DB
  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.isPrimary !== undefined) dbUpdates.is_primary = updates.isPrimary;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.available24x7 !== undefined) dbUpdates.available_24x7 = updates.available24x7;

  const { error } = await supabase
    .from('emergency_contacts')
    .update(dbUpdates)
    .eq('id', contactId);

  if (error) {
    console.error('Error updating emergency contact:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Delete an emergency contact
 */
export async function deleteEmergencyContact(contactId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  if (error) {
    console.error('Error deleting emergency contact:', error);
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}
