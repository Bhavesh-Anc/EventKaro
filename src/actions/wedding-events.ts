'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type WeddingEventName = 'engagement' | 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'custom';

export interface WeddingEvent {
  id: string;
  parent_event_id: string;
  event_name: WeddingEventName;
  custom_event_name: string | null;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  dress_code: string | null;
  theme_colors: string[] | null;
  transportation_provided: boolean;
  transportation_notes: string | null;
  expected_guest_count: number | null;
  actual_guest_count: number;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  sequence_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getWeddingEvents(parentEventId: string): Promise<WeddingEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('parent_event_id', parentEventId)
    .order('sequence_order', { ascending: true });

  if (error) {
    console.error('Error fetching wedding events:', error);
    return [];
  }

  return data || [];
}

export async function createDefaultWeddingEvents(parentEventId: string, weddingDate: string) {
  const supabase = await createClient();

  // Call the SQL function to create default events
  const { error } = await supabase.rpc('create_default_wedding_events', {
    parent_id: parentEventId,
    wedding_date: weddingDate,
  });

  if (error) {
    console.error('Error creating default wedding events:', error);
    throw new Error(`Failed to create wedding events: ${error.message}`);
  }

  revalidatePath(`/events/${parentEventId}/wedding-timeline`);
}

export async function createWeddingEvent(formData: FormData) {
  const supabase = await createClient();

  const parentEventId = formData.get('parent_event_id') as string;
  const eventName = formData.get('event_name') as WeddingEventName;
  const customEventName = formData.get('custom_event_name') as string | null;
  const description = formData.get('description') as string | null;
  const startDatetime = formData.get('start_datetime') as string;
  const endDatetime = formData.get('end_datetime') as string;
  const venueName = formData.get('venue_name') as string | null;
  const venueAddress = formData.get('venue_address') as string | null;
  const venueCity = formData.get('venue_city') as string | null;
  const venueState = formData.get('venue_state') as string | null;
  const dressCode = formData.get('dress_code') as string | null;
  const themeColors = formData.get('theme_colors') as string | null;
  const transportationProvided = formData.get('transportation_provided') === 'true';
  const transportationNotes = formData.get('transportation_notes') as string | null;
  const expectedGuestCount = formData.get('expected_guest_count')
    ? parseInt(formData.get('expected_guest_count') as string)
    : null;
  const sequenceOrder = formData.get('sequence_order')
    ? parseInt(formData.get('sequence_order') as string)
    : null;
  const notes = formData.get('notes') as string | null;

  // Get the highest sequence order if not provided
  let finalSequenceOrder = sequenceOrder;
  if (!sequenceOrder) {
    const { data: maxSeq } = await supabase
      .from('wedding_events')
      .select('sequence_order')
      .eq('parent_event_id', parentEventId)
      .order('sequence_order', { ascending: false })
      .limit(1)
      .single();

    finalSequenceOrder = (maxSeq?.sequence_order || 0) + 1;
  }

  const { error } = await supabase
    .from('wedding_events')
    .insert({
      parent_event_id: parentEventId,
      event_name: eventName,
      custom_event_name: customEventName,
      description,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      venue_name: venueName,
      venue_address: venueAddress,
      venue_city: venueCity,
      venue_state: venueState,
      dress_code: dressCode,
      theme_colors: themeColors ? themeColors.split(',').map(c => c.trim()) : null,
      transportation_provided: transportationProvided,
      transportation_notes: transportationNotes,
      expected_guest_count: expectedGuestCount,
      sequence_order: finalSequenceOrder,
      notes,
    });

  if (error) {
    console.error('Error creating wedding event:', error);
    throw new Error(`Failed to create wedding event: ${error.message}`);
  }

  revalidatePath(`/events/${parentEventId}/wedding-timeline`);
  redirect(`/events/${parentEventId}/wedding-timeline`);
}

export async function updateWeddingEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const parentEventId = formData.get('parent_event_id') as string;
  const description = formData.get('description') as string | null;
  const startDatetime = formData.get('start_datetime') as string;
  const endDatetime = formData.get('end_datetime') as string;
  const venueName = formData.get('venue_name') as string | null;
  const venueAddress = formData.get('venue_address') as string | null;
  const venueCity = formData.get('venue_city') as string | null;
  const dressCode = formData.get('dress_code') as string | null;
  const themeColors = formData.get('theme_colors') as string | null;
  const expectedGuestCount = formData.get('expected_guest_count')
    ? parseInt(formData.get('expected_guest_count') as string)
    : null;
  const status = formData.get('status') as WeddingEvent['status'] | null;
  const notes = formData.get('notes') as string | null;

  const { error } = await supabase
    .from('wedding_events')
    .update({
      description,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      venue_name: venueName,
      venue_address: venueAddress,
      venue_city: venueCity,
      dress_code: dressCode,
      theme_colors: themeColors ? themeColors.split(',').map(c => c.trim()) : null,
      expected_guest_count: expectedGuestCount,
      status,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating wedding event:', error);
    throw new Error(`Failed to update wedding event: ${error.message}`);
  }

  revalidatePath(`/events/${parentEventId}/wedding-timeline`);
}

export async function deleteWeddingEvent(eventId: string, parentEventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wedding_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting wedding event:', error);
    throw new Error(`Failed to delete wedding event: ${error.message}`);
  }

  revalidatePath(`/events/${parentEventId}/wedding-timeline`);
}

export async function updateWeddingEventSequence(eventId: string, newSequence: number, parentEventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wedding_events')
    .update({ sequence_order: newSequence })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating sequence:', error);
    throw new Error(`Failed to update sequence: ${error.message}`);
  }

  revalidatePath(`/events/${parentEventId}/wedding-timeline`);
}

// Get timeline conflicts
export async function getWeddingEventConflicts(parentEventId: string) {
  const supabase = await createClient();

  const { data: eventConflicts } = await supabase
    .from('wedding_event_conflicts')
    .select('*');

  const { data: vendorConflicts } = await supabase
    .from('wedding_vendor_conflicts')
    .select('*');

  return {
    eventConflicts: eventConflicts || [],
    vendorConflicts: vendorConflicts || [],
  };
}
