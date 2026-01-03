'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  status: 'active' | 'pending' | 'declined';
}

/**
 * Get team members for an event
 */
export async function getEventTeamMembers(eventId: string): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_team_members')
    .select(`
      *,
      user:profiles(id, full_name, email, avatar_url)
    `)
    .eq('event_id', eventId)
    .order('role')
    .order('created_at');

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    name: m.user?.full_name || m.invited_email?.split('@')[0] || 'Unknown',
    email: m.user?.email || m.invited_email,
    role: m.role,
    avatar: m.user?.avatar_url,
    invitedAt: new Date(m.created_at),
    acceptedAt: m.accepted_at ? new Date(m.accepted_at) : undefined,
    status: m.status || 'pending',
  }));
}

/**
 * Invite a team member
 */
export async function inviteTeamMember(
  eventId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer'
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if already invited
  const { data: existing } = await supabase
    .from('event_team_members')
    .select('id')
    .eq('event_id', eventId)
    .eq('invited_email', email.toLowerCase())
    .single();

  if (existing) {
    return { error: 'This email has already been invited' };
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  const { error } = await supabase
    .from('event_team_members')
    .insert({
      event_id: eventId,
      user_id: existingUser?.id || null,
      invited_email: email.toLowerCase(),
      role,
      invited_by: user.id,
      status: 'pending',
    });

  if (error) {
    console.error('Error inviting team member:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/team`);
  return { success: true };
}

/**
 * Remove a team member
 */
export async function removeTeamMember(memberId: string, eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_team_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Error removing team member:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/team`);
  return { success: true };
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  memberId: string,
  eventId: string,
  role: 'admin' | 'editor' | 'viewer'
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_team_members')
    .update({ role })
    .eq('id', memberId);

  if (error) {
    console.error('Error updating team member role:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/team`);
  return { success: true };
}

/**
 * Resend invitation
 */
export async function resendTeamInvite(memberId: string, eventId: string) {
  // In a real app, this would send an email
  // For now, just update the invited_at timestamp
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_team_members')
    .update({ created_at: new Date().toISOString() })
    .eq('id', memberId);

  if (error) {
    console.error('Error resending invite:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/team`);
  return { success: true };
}
