'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Get all seating tables for an event
 */
export async function getSeatingTables(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seating_tables')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching seating tables:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new seating table
 */
export async function createSeatingTable(
  eventId: string,
  table: {
    name: string;
    capacity: number;
    shape: 'round' | 'rectangular' | 'oval';
    category: 'vip' | 'family' | 'friends' | 'general';
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seating_tables')
    .insert({
      event_id: eventId,
      ...table,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating seating table:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true, table: data };
}

/**
 * Update a seating table
 */
export async function updateSeatingTable(
  tableId: string,
  updates: Partial<{
    name: string;
    capacity: number;
    shape: 'round' | 'rectangular' | 'oval';
    category: 'vip' | 'family' | 'friends' | 'general';
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('seating_tables')
    .update(updates)
    .eq('id', tableId);

  if (error) {
    console.error('Error updating seating table:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Delete a seating table
 */
export async function deleteSeatingTable(tableId: string) {
  const supabase = await createClient();

  // First, unassign all guests from this table
  await supabase
    .from('guests')
    .update({ table_id: null, seat_number: null })
    .eq('table_id', tableId);

  // Then delete the table
  const { error } = await supabase
    .from('seating_tables')
    .delete()
    .eq('id', tableId);

  if (error) {
    console.error('Error deleting seating table:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Assign a guest to a table
 */
export async function assignGuestToTable(
  guestId: string,
  tableId: string,
  seatNumber: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .update({
      table_id: tableId,
      seat_number: seatNumber,
    })
    .eq('id', guestId);

  if (error) {
    console.error('Error assigning guest to table:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Remove guest from table
 */
export async function removeGuestFromTable(guestId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .update({
      table_id: null,
      seat_number: null,
    })
    .eq('id', guestId);

  if (error) {
    console.error('Error removing guest from table:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Get guests with seating info
 */
export async function getGuestsWithSeating(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select(`
      id,
      first_name,
      last_name,
      family_group_name,
      family_side,
      table_id,
      seat_number,
      is_vip,
      is_elderly,
      is_child,
      rsvp_status
    `)
    .eq('event_id', eventId)
    .in('rsvp_status', ['accepted', 'pending'])
    .order('family_group_name', { ascending: true });

  if (error) {
    console.error('Error fetching guests with seating:', error);
    return [];
  }

  return (data || []).map((g: any) => ({
    id: g.id,
    name: `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown',
    familyName: g.family_group_name || 'Unknown',
    familySide: g.family_side || 'bride',
    tableId: g.table_id,
    seatNumber: g.seat_number,
    isVip: g.is_vip || false,
    isElderly: g.is_elderly || false,
    isChild: g.is_child || false,
  }));
}

/**
 * Auto-assign guests to tables based on family groups
 */
export async function autoAssignSeating(eventId: string) {
  const supabase = await createClient();

  // Get all tables
  const { data: tables } = await supabase
    .from('seating_tables')
    .select('*')
    .eq('event_id', eventId)
    .order('category', { ascending: true });

  if (!tables || tables.length === 0) {
    return { error: 'No tables available' };
  }

  // Get unassigned guests grouped by family
  const { data: guests } = await supabase
    .from('guests')
    .select(`
      id,
      family_group_name,
      family_side,
      is_vip,
      is_elderly
    `)
    .eq('event_id', eventId)
    .is('table_id', null)
    .in('rsvp_status', ['accepted', 'pending']);

  if (!guests || guests.length === 0) {
    return { success: true, message: 'No guests to assign' };
  }

  // Group guests by family
  const familyGroups = new Map<string, any[]>();
  guests.forEach((guest) => {
    const key = guest.family_group_name || 'Unknown';
    if (!familyGroups.has(key)) {
      familyGroups.set(key, []);
    }
    familyGroups.get(key)!.push(guest);
  });

  // Track table occupancy
  const tableOccupancy = new Map<string, number>();
  tables.forEach((t) => tableOccupancy.set(t.id, 0));

  // Get current occupancy
  const { data: currentSeating } = await supabase
    .from('guests')
    .select('table_id')
    .eq('event_id', eventId)
    .not('table_id', 'is', null);

  currentSeating?.forEach((g: any) => {
    const current = tableOccupancy.get(g.table_id) || 0;
    tableOccupancy.set(g.table_id, current + 1);
  });

  // Assign families to tables
  let assigned = 0;

  for (const [familyName, members] of familyGroups) {
    // Find a table with enough space for the whole family
    const hasVip = members.some((m) => m.is_vip);
    const hasElderly = members.some((m) => m.is_elderly);

    // Priority: VIP tables for VIP guests, then family tables for elderly
    const sortedTables = [...tables].sort((a, b) => {
      if (hasVip && a.category === 'vip') return -1;
      if (hasVip && b.category === 'vip') return 1;
      if (hasElderly && a.category === 'family') return -1;
      if (hasElderly && b.category === 'family') return 1;
      return 0;
    });

    for (const table of sortedTables) {
      const currentOccupancy = tableOccupancy.get(table.id) || 0;
      const availableSeats = table.capacity - currentOccupancy;

      if (availableSeats >= members.length) {
        // Assign all family members to this table
        for (let i = 0; i < members.length; i++) {
          await supabase
            .from('guests')
            .update({
              table_id: table.id,
              seat_number: currentOccupancy + i + 1,
            })
            .eq('id', members[i].id);
        }

        tableOccupancy.set(table.id, currentOccupancy + members.length);
        assigned += members.length;
        break;
      }
    }
  }

  revalidatePath('/guests');
  return { success: true, assigned };
}
