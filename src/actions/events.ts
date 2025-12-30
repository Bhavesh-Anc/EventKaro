'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const organizationId = formData.get('organization_id') as string;
  const title = formData.get('title') as string;
  const slug = generateSlug(formData.get('slug') as string || title);
  const description = formData.get('description') as string;
  const eventType = formData.get('event_type') as string;
  const startDate = formData.get('start_date') as string;
  let endDate = formData.get('end_date') as string;

  // For wedding events, set end_date to start_date if not provided
  if (eventType === 'wedding' && !endDate) {
    endDate = startDate;
  }

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
      status: 'published',
    })
    .select()
    .single();

  if (eventError) {
    console.error('Error creating event:', eventError);
    redirect('/dashboard');
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');

  // Redirect to dashboard after creating event
  redirect('/dashboard');
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

export async function getUserEvents() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all organizations the user is a member of
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  if (!memberships || memberships.length === 0) return [];

  const organizationIds = memberships.map(m => m.organization_id);

  // Get all events from these organizations
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      start_date,
      end_date,
      venue_name,
      venue_city,
      capacity,
      event_type,
      organization_id,
      organizations (
        name
      )
    `)
    .in('organization_id', organizationIds)
    .is('deleted_at', null)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching user events:', error);
    return [];
  }

  return data;
}

/**
 * Get current wedding event info for the logged-in user
 * Used by sidebar and other components that need wedding date
 */
export async function getCurrentWedding() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get user's organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  if (!memberships || memberships.length === 0) {
    return null;
  }

  const organizationIds = memberships.map((m) => m.organization_id);

  // Get wedding event
  const { data: wedding, error } = await supabase
    .from('events')
    .select('id, title, start_date, venue_name, venue_city')
    .in('organization_id', organizationIds)
    .eq('event_type', 'wedding')
    .is('deleted_at', null)
    .limit(1)
    .single();

  if (error || !wedding) {
    return null;
  }

  // Calculate days remaining
  const weddingDate = new Date(wedding.start_date);
  const today = new Date();
  const daysRemaining = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: wedding.id,
    title: wedding.title,
    date: wedding.start_date,
    venueName: wedding.venue_name,
    venueCity: wedding.venue_city,
    daysRemaining: Math.max(0, daysRemaining),
  };
}
