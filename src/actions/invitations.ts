'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export interface Invitation {
  id: string;
  guest_id: string;
  event_id: string;
  token: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'rsvp_completed';
  sent_via: 'email' | 'whatsapp' | 'sms' | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  rsvp_completed_at: string | null;
  template_id: string | null;
  personalized_message: string | null;
  guest?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp_number: string | null;
  };
}

export interface InvitationTemplate {
  id: string;
  name: string;
  type: 'save_the_date' | 'invitation' | 'reminder' | 'thank_you';
  design: 'traditional' | 'modern' | 'minimal' | 'floral' | 'royal';
  content: {
    header: string;
    body: string;
    footer: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  is_default: boolean;
}

/**
 * Get all invitations for an event
 */
export async function getEventInvitations(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      guest:guests(id, name, email, phone, whatsapp_number)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }

  return data || [];
}

/**
 * Get invitation statistics for an event
 */
export async function getInvitationStats(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invitations')
    .select('status')
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching invitation stats:', error);
    return {
      total: 0,
      draft: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      rsvp_completed: 0,
    };
  }

  const stats = {
    total: data.length,
    draft: data.filter(i => i.status === 'draft').length,
    sent: data.filter(i => i.status === 'sent').length,
    delivered: data.filter(i => i.status === 'delivered').length,
    opened: data.filter(i => i.status === 'opened').length,
    rsvp_completed: data.filter(i => i.status === 'rsvp_completed').length,
  };

  return stats;
}

/**
 * Create invitations for guests who don't have one yet
 */
export async function createInvitationsForGuests(eventId: string, guestIds: string[]) {
  const supabase = await createClient();

  const invitations = guestIds.map(guestId => ({
    event_id: eventId,
    guest_id: guestId,
    token: crypto.randomBytes(32).toString('hex'),
    status: 'draft',
  }));

  const { error } = await supabase
    .from('invitations')
    .insert(invitations);

  if (error) {
    console.error('Error creating invitations:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/invitations`);
  return { success: true, count: guestIds.length };
}

/**
 * Create invitations for all guests without invitations
 */
export async function createInvitationsForAllGuests(eventId: string) {
  const supabase = await createClient();

  // Get all guests without invitations
  const { data: guests } = await supabase
    .from('guests')
    .select('id')
    .eq('event_id', eventId);

  const { data: existingInvitations } = await supabase
    .from('invitations')
    .select('guest_id')
    .eq('event_id', eventId);

  const existingGuestIds = new Set(existingInvitations?.map(i => i.guest_id) || []);
  const guestsWithoutInvitations = guests?.filter(g => !existingGuestIds.has(g.id)) || [];

  if (guestsWithoutInvitations.length === 0) {
    return { success: true, count: 0, message: 'All guests already have invitations' };
  }

  return createInvitationsForGuests(eventId, guestsWithoutInvitations.map(g => g.id));
}

/**
 * Send invitation via email
 */
export async function sendInvitationEmail(invitationId: string, customMessage?: string) {
  const supabase = await createClient();

  // Get invitation with guest details
  const { data: invitation } = await supabase
    .from('invitations')
    .select(`
      *,
      guest:guests(id, name, email),
      event:events(id, title, start_date, venue_name, venue_address)
    `)
    .eq('id', invitationId)
    .single();

  if (!invitation || !invitation.guest?.email) {
    return { error: 'Invalid invitation or guest has no email' };
  }

  // TODO: Integrate with actual email service (SendGrid, Resend, etc.)
  // For now, we'll just update the status

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'sent',
      sent_via: 'email',
      sent_at: new Date().toISOString(),
      personalized_message: customMessage,
    })
    .eq('id', invitationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Send invitation via WhatsApp
 */
export async function sendInvitationWhatsApp(invitationId: string, customMessage?: string) {
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from('invitations')
    .select(`
      *,
      guest:guests(id, name, whatsapp_number, phone)
    `)
    .eq('id', invitationId)
    .single();

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  const whatsappNumber = invitation.guest?.whatsapp_number || invitation.guest?.phone;
  if (!whatsappNumber) {
    return { error: 'Guest has no WhatsApp number' };
  }

  // TODO: Integrate with WhatsApp Business API
  // For now, we'll just update the status

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'sent',
      sent_via: 'whatsapp',
      sent_at: new Date().toISOString(),
      personalized_message: customMessage,
    })
    .eq('id', invitationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Bulk send invitations
 */
export async function bulkSendInvitations(
  invitationIds: string[],
  via: 'email' | 'whatsapp',
  customMessage?: string
) {
  const results = await Promise.all(
    invitationIds.map(id =>
      via === 'email'
        ? sendInvitationEmail(id, customMessage)
        : sendInvitationWhatsApp(id, customMessage)
    )
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => r.error).length;

  return { successful, failed, total: invitationIds.length };
}

/**
 * Mark invitation as opened (called when guest views invitation)
 */
export async function markInvitationOpened(token: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'opened',
      opened_at: new Date().toISOString(),
    })
    .eq('token', token)
    .in('status', ['sent', 'delivered']);

  if (error) {
    console.error('Error marking invitation opened:', error);
  }
}

/**
 * Mark invitation RSVP completed
 */
export async function markInvitationRSVPCompleted(token: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'rsvp_completed',
      rsvp_completed_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (error) {
    console.error('Error marking RSVP completed:', error);
  }
}

/**
 * Get invitation by token (for public RSVP page)
 */
export async function getInvitationByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      guest:guests(*),
      event:events(*)
    `)
    .eq('token', token)
    .single();

  if (error) {
    return null;
  }

  // Mark as opened if first view
  if (data && ['sent', 'delivered'].includes(data.status)) {
    await markInvitationOpened(token);
  }

  return data;
}

/**
 * Get invitation templates
 */
export async function getInvitationTemplates() {
  // Return default templates (can be stored in DB later)
  const templates: InvitationTemplate[] = [
    {
      id: 'traditional-1',
      name: 'Traditional Elegance',
      type: 'invitation',
      design: 'traditional',
      content: {
        header: 'With the blessings of the Almighty',
        body: 'We cordially invite you to celebrate the wedding of',
        footer: 'Your presence will make our celebration complete',
      },
      colors: {
        primary: '#8B0000',
        secondary: '#FFD700',
        accent: '#FFF8DC',
      },
      is_default: true,
    },
    {
      id: 'modern-1',
      name: 'Modern Minimal',
      type: 'invitation',
      design: 'modern',
      content: {
        header: "You're Invited",
        body: 'Join us as we celebrate love',
        footer: 'We hope to see you there!',
      },
      colors: {
        primary: '#2C3E50',
        secondary: '#E74C3C',
        accent: '#ECF0F1',
      },
      is_default: false,
    },
    {
      id: 'floral-1',
      name: 'Floral Romance',
      type: 'invitation',
      design: 'floral',
      content: {
        header: 'Together with their families',
        body: 'Request the pleasure of your company at the marriage of',
        footer: 'Dinner and celebrations to follow',
      },
      colors: {
        primary: '#D4A5A5',
        secondary: '#4A4A4A',
        accent: '#FDF5E6',
      },
      is_default: false,
    },
    {
      id: 'royal-1',
      name: 'Royal Celebration',
      type: 'invitation',
      design: 'royal',
      content: {
        header: 'Shubh Vivah',
        body: 'You are cordially invited to witness the sacred union of',
        footer: 'Kindly grace the occasion with your presence',
      },
      colors: {
        primary: '#4B0082',
        secondary: '#FFD700',
        accent: '#FFFAF0',
      },
      is_default: false,
    },
  ];

  return templates;
}

/**
 * Generate shareable invitation link
 */
export async function generateInvitationLink(invitationId: string, baseUrl: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('invitations')
    .select('token')
    .eq('id', invitationId)
    .single();

  if (!data) {
    return null;
  }

  return `${baseUrl}/invite/${data.token}`;
}
