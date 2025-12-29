'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const eventTemplates: Record<string, { name: string; hoursFromStart: number; duration: number }> = {
  engagement: { name: 'Engagement', hoursFromStart: -720, duration: 3 }, // 30 days before
  mehendi: { name: 'Mehendi', hoursFromStart: -48, duration: 4 }, // 2 days before
  haldi: { name: 'Haldi', hoursFromStart: -24, duration: 3 }, // 1 day before
  sangeet: { name: 'Sangeet', hoursFromStart: -12, duration: 5 }, // Evening before
  wedding: { name: 'Wedding', hoursFromStart: 0, duration: 4 }, // Main day
  reception: { name: 'Reception', hoursFromStart: 6, duration: 4 }, // Evening of main day
};

export async function createWeddingSubEvents(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const parentEventId = formData.get('parent_event_id') as string;
  const eventDate = formData.get('event_date') as string;
  const selectedEvents = formData.getAll('selected_events') as string[];
  const customEventNames = formData.getAll('custom_event_names') as string[];
  const customEventDescriptions = formData.getAll('custom_event_descriptions') as string[];

  if (!parentEventId || !eventDate) {
    redirect('/dashboard');
  }

  // Get the parent event details
  const { data: parentEvent } = await supabase
    .from('events')
    .select('*')
    .eq('id', parentEventId)
    .single();

  if (!parentEvent) {
    redirect('/dashboard');
  }

  const weddingDate = new Date(eventDate);
  const eventsToCreate = [];

  // Prepare standard events
  for (const eventId of selectedEvents) {
    const template = eventTemplates[eventId];
    if (!template) continue;

    const startDatetime = new Date(weddingDate);
    startDatetime.setHours(startDatetime.getHours() + template.hoursFromStart);

    const endDatetime = new Date(startDatetime);
    endDatetime.setHours(endDatetime.getHours() + template.duration);

    eventsToCreate.push({
      parent_event_id: parentEventId,
      organization_id: parentEvent.organization_id,
      event_name: eventId,
      custom_event_name: null,
      description: `${template.name} ceremony`,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      venue_name: parentEvent.venue_name,
      venue_address: null,
      expected_guest_count: parentEvent.capacity,
      status: 'planned',
    });
  }

  // Prepare custom events
  for (let i = 0; i < customEventNames.length; i++) {
    const name = customEventNames[i]?.trim();
    if (!name) continue;

    const description = customEventDescriptions[i]?.trim() || '';

    // Schedule custom events at reasonable defaults (day before wedding)
    const startDatetime = new Date(weddingDate);
    startDatetime.setHours(startDatetime.getHours() - 36); // 1.5 days before

    const endDatetime = new Date(startDatetime);
    endDatetime.setHours(endDatetime.getHours() + 3);

    eventsToCreate.push({
      parent_event_id: parentEventId,
      organization_id: parentEvent.organization_id,
      event_name: 'custom',
      custom_event_name: name,
      description: description || `${name} ceremony`,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      venue_name: parentEvent.venue_name,
      venue_address: null,
      expected_guest_count: parentEvent.capacity,
      status: 'planned',
    });
  }

  // Insert all events
  if (eventsToCreate.length > 0) {
    const { error } = await supabase
      .from('wedding_events')
      .insert(eventsToCreate);

    if (error) {
      console.error('Error creating wedding events:', error);
      redirect('/dashboard');
    }
  }

  revalidatePath('/dashboard');
  revalidatePath(`/events/${parentEventId}`);

  redirect('/dashboard');
}
