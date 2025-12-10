'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const organizationId = formData.get('organization_id') as string;
  const title = formData.get('title') as string;
  const slug = generateSlug(formData.get('slug') as string || title);
  const description = formData.get('description') as string;
  const eventType = formData.get('event_type') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const venueType = formData.get('venue_type') as string;
  const venueName = formData.get('venue_name') as string || null;
  const venueCity = formData.get('venue_city') as string || null;
  const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null;
  const isFree = formData.get('is_free') === 'on';

  // Create event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      organization_id: organizationId,
      title,
      slug,
      description,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      venue_type: venueType,
      venue_name: venueName,
      venue_city: venueCity,
      capacity,
      is_free: isFree,
      status: 'draft',
    })
    .select()
    .single();

  if (eventError) {
    return { error: eventError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  redirect(`/events/${event.id}`);
}

export async function getOrganizationEvents(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function getEvent(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) return null;
  return data;
}

export async function updateEventStatus(eventId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
