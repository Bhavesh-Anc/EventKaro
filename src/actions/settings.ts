'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganizations } from '@/actions/organizations';
import { DEFAULT_WEDDING_SETTINGS, type WeddingSettings } from '@/lib/wedding-settings';

/**
 * Get settings for a specific wedding event. Falls back to sensible defaults
 * when no row exists yet (so the app works before settings are saved).
 */
export async function getWeddingSettings(eventId: string): Promise<WeddingSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_settings')
    .select('total_budget_inr, catering_per_head_inr, room_per_night_inr, transport_per_seat_inr')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching wedding settings:', error);
    return DEFAULT_WEDDING_SETTINGS;
  }

  return { ...DEFAULT_WEDDING_SETTINGS, ...(data ?? {}) };
}

/**
 * Resolve the current organization's wedding event id (mirrors budget/dashboard pages).
 */
async function getCurrentWeddingEventId(): Promise<string | null> {
  const organizations = await getUserOrganizations();
  if (organizations.length === 0) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('id')
    .eq('organization_id', organizations[0].id)
    .eq('event_type', 'wedding')
    .order('start_date', { ascending: true })
    .limit(1);

  return data?.[0]?.id ?? null;
}

/**
 * Get settings for the current wedding (used by pages without an explicit eventId).
 */
export async function getCurrentWeddingSettings(): Promise<WeddingSettings> {
  const eventId = await getCurrentWeddingEventId();
  if (!eventId) return DEFAULT_WEDDING_SETTINGS;
  return getWeddingSettings(eventId);
}

/**
 * Upsert settings for the current wedding event.
 */
export async function updateCurrentWeddingSettings(
  settings: Partial<WeddingSettings>
): Promise<{ success: boolean; error?: string }> {
  const eventId = await getCurrentWeddingEventId();
  if (!eventId) {
    return { success: false, error: 'No wedding event found for your organization' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('wedding_settings')
    .upsert({ event_id: eventId, ...settings }, { onConflict: 'event_id' });

  if (error) {
    console.error('Error updating wedding settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/budget/settings');
  revalidatePath('/dashboard');
  revalidatePath('/guests');
  return { success: true };
}
