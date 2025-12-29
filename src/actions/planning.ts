'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ============================================
// GUEST LIST MANAGEMENT
// ============================================

export async function getEventGuests(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guests:', error);
    return [];
  }

  return data;
}

export async function addEventGuest(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const eventId = formData.get('event_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const guestType = formData.get('guest_type') as string;
  const category = formData.get('category') as string | null;
  const plusOneAllowed = formData.get('plus_one_allowed') === 'true';

  const { error } = await supabase
    .from('guests')
    .insert({
      event_id: eventId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      guest_type: guestType,
      category,
      plus_one_allowed: plusOneAllowed,
    });

  if (error) {
    console.error('Error adding guest:', error);
    throw new Error('Failed to add guest');
  }

  revalidatePath(`/events/${eventId}/guests`);
}

export async function updateGuest(guestId: string, formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const guestType = formData.get('guest_type') as string;
  const rsvpStatus = formData.get('rsvp_status') as string;

  const { error } = await supabase
    .from('guests')
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      guest_type: guestType,
      rsvp_status: rsvpStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', guestId);

  if (error) {
    console.error('Error updating guest:', error);
    throw new Error('Failed to update guest');
  }

  revalidatePath('/events');
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', guestId);

  if (error) {
    console.error('Error deleting guest:', error);
    throw new Error('Failed to delete guest');
  }

  revalidatePath('/events');
}

export async function checkInGuest(guestId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', guestId);

  if (error) {
    console.error('Error checking in guest:', error);
    throw new Error('Failed to check in guest');
  }

  revalidatePath('/events');
}

export async function getRSVPStats(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('event_id', eventId);

  if (error || !data) return { accepted: 0, declined: 0, pending: 0, maybe: 0 };

  const stats = {
    accepted: data.filter(g => g.rsvp_status === 'accepted').length,
    declined: data.filter(g => g.rsvp_status === 'declined').length,
    pending: data.filter(g => g.rsvp_status === 'pending' || g.rsvp_status === 'no_response').length,
    maybe: data.filter(g => g.rsvp_status === 'maybe').length,
  };

  return stats;
}

// ============================================
// EVENT TIMELINE
// ============================================

export async function getEventTimeline(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_timeline')
    .select(`
      *,
      vendor:vendors(id, business_name)
    `)
    .eq('event_id', eventId)
    .order('scheduled_time', { ascending: true });

  if (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }

  return data;
}

export async function addTimelineItem(formData: FormData) {
  const supabase = await createClient();

  const eventId = formData.get('event_id') as string;
  const itemTitle = formData.get('item_title') as string;
  const itemDescription = formData.get('item_description') as string | null;
  const itemType = formData.get('item_type') as string;
  const scheduledTime = formData.get('scheduled_time') as string;
  const durationMinutes = formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : null;
  const responsiblePerson = formData.get('responsible_person') as string | null;

  const { error } = await supabase
    .from('event_timeline')
    .insert({
      event_id: eventId,
      item_title: itemTitle,
      item_description: itemDescription,
      item_type: itemType,
      scheduled_time: scheduledTime,
      duration_minutes: durationMinutes,
      responsible_person: responsiblePerson,
    });

  if (error) {
    console.error('Error adding timeline item:', error);
    throw new Error('Failed to add timeline item');
  }

  revalidatePath(`/events/${eventId}/timeline`);
}

export async function updateTimelineItemStatus(itemId: string, status: string) {
  const supabase = await createClient();

  const updates: any = { status };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('event_timeline')
    .update(updates)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating timeline item:', error);
    throw new Error('Failed to update timeline item');
  }

  revalidatePath('/events');
}

// ============================================
// CHECKLISTS
// ============================================

export async function getEventChecklists(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_checklists')
    .select(`
      *,
      checklist_items (
        id, item_text, is_completed, due_date, priority, display_order
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching checklists:', error);
    return [];
  }

  return data;
}

export async function createChecklistFromTemplate(eventId: string, templateId: string) {
  const supabase = await createClient();

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    throw new Error('Template not found');
  }

  // Get event date
  const { data: event } = await supabase
    .from('events')
    .select('start_date')
    .eq('id', eventId)
    .single();

  if (!event) {
    throw new Error('Event not found');
  }

  // Create checklist
  const { data: checklist, error: checklistError } = await supabase
    .from('event_checklists')
    .insert({
      event_id: eventId,
      checklist_name: template.template_name,
      checklist_category: 'general',
    })
    .select()
    .single();

  if (checklistError || !checklist) {
    throw new Error('Failed to create checklist');
  }

  // Create checklist items from template
  const eventDate = new Date(event.start_date);
  const items = (template.template_items as any[]).map((item: any, index: number) => {
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - (item.due_days_before || 0));

    return {
      checklist_id: checklist.id,
      item_text: item.text,
      item_description: item.description || null,
      due_date: dueDate.toISOString().split('T')[0],
      priority: item.priority || 'medium',
      display_order: index,
    };
  });

  const { error: itemsError } = await supabase
    .from('checklist_items')
    .insert(items);

  if (itemsError) {
    console.error('Error creating checklist items:', itemsError);
    throw new Error('Failed to create checklist items');
  }

  revalidatePath(`/events/${eventId}/checklist`);
  return checklist;
}

export async function addChecklistItem(formData: FormData) {
  const supabase = await createClient();

  const checklistId = formData.get('checklist_id') as string;
  const itemText = formData.get('item_text') as string;
  const dueDate = formData.get('due_date') as string | null;
  const priority = formData.get('priority') as string;

  const { error } = await supabase
    .from('checklist_items')
    .insert({
      checklist_id: checklistId,
      item_text: itemText,
      due_date: dueDate,
      priority,
    });

  if (error) {
    console.error('Error adding checklist item:', error);
    throw new Error('Failed to add checklist item');
  }

  revalidatePath('/events');
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const updates: any = {
    is_completed: isCompleted,
    updated_at: new Date().toISOString(),
  };

  if (isCompleted) {
    updates.completed_at = new Date().toISOString();
    updates.completed_by = user?.id;
  } else {
    updates.completed_at = null;
    updates.completed_by = null;
  }

  const { error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', itemId);

  if (error) {
    console.error('Error toggling checklist item:', error);
    throw new Error('Failed to update checklist item');
  }

  revalidatePath('/events');
}

export async function getChecklistTemplates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('is_system_template', true)
    .order('event_type', { ascending: true });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data;
}

// ============================================
// VENDOR COORDINATION
// ============================================

export async function getVendorCoordination(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_coordination')
    .select(`
      *,
      vendor:vendors(id, business_name, business_type, phone, email),
      booking:vendor_bookings(id, service_type, total_amount_inr, status)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching vendor coordination:', error);
    return [];
  }

  return data;
}

export async function updateVendorCoordination(coordinationId: string, formData: FormData) {
  const supabase = await createClient();

  const contractSigned = formData.get('contract_signed') === 'true';
  const paymentScheduleAgreed = formData.get('payment_schedule_agreed') === 'true';
  const vendorConfirmed = formData.get('vendor_confirmed') === 'true';
  const coordinationStatus = formData.get('coordination_status') as string;
  const contactNotes = formData.get('contact_notes') as string | null;

  const { error } = await supabase
    .from('vendor_coordination')
    .update({
      contract_signed: contractSigned,
      payment_schedule_agreed: paymentScheduleAgreed,
      vendor_confirmed: vendorConfirmed,
      coordination_status: coordinationStatus,
      contact_notes: contactNotes,
      last_contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', coordinationId);

  if (error) {
    console.error('Error updating vendor coordination:', error);
    throw new Error('Failed to update vendor coordination');
  }

  revalidatePath('/events');
}

export async function createVendorCoordination(eventId: string, vendorId: string, bookingId: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('vendor_coordination')
    .insert({
      event_id: eventId,
      vendor_id: vendorId,
      booking_id: bookingId,
    });

  if (error) {
    console.error('Error creating vendor coordination:', error);
    throw new Error('Failed to create vendor coordination');
  }

  revalidatePath(`/events/${eventId}/vendor-coordination`);
}

// ============================================
// GUEST INVITATIONS & SELF-REGISTRATION
// ============================================

export async function createGuestInvitation(eventId: string, guestId: string | null, recipientData: {
  email?: string;
  phone?: string;
  name?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('guest_invitations')
    .insert({
      event_id: eventId,
      guest_id: guestId,
      recipient_email: recipientData.email,
      recipient_phone: recipientData.phone,
      recipient_name: recipientData.name,
      invitation_type: guestId ? 'individual' : 'general',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }

  revalidatePath(`/events/${eventId}/guests`);
  return data;
}

export async function getInvitationByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guest_invitations')
    .select(`
      *,
      event:events(id, title, start_date, end_date, location, event_type),
      guest:guests(id, first_name, last_name, email, phone)
    `)
    .eq('invitation_token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    console.error('Error fetching invitation:', error);
    return null;
  }

  // Track that invitation was opened
  await supabase
    .from('guest_invitations')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', data.id);

  return data;
}

export async function getGuestByInvitationToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select(`
      *,
      event:events(id, title, start_date, end_date, venue_name, venue_city, event_type, organization_id)
    `)
    .eq('invitation_token', token)
    .gt('invitation_expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    console.error('Error fetching guest by token:', error);
    return null;
  }

  return data;
}

export async function submitGuestRSVP(formData: FormData) {
  const supabase = await createClient();

  const invitationToken = formData.get('invitation_token') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string | null;
  const phone = formData.get('phone') as string | null;
  const rsvpStatus = formData.get('rsvp_status') as string;
  const numberOfGuests = parseInt(formData.get('number_of_guests') as string) || 1;
  const guestNamesStr = formData.get('guest_names') as string | null;
  const guestNames = guestNamesStr ? guestNamesStr.split(',').map(n => n.trim()).filter(Boolean) : null;

  // Dietary requirements
  const dietaryRequirements = formData.get('dietary_requirements') as string | null;
  const accessibilityNeeds = formData.get('accessibility_needs') as string | null;
  const specialRequests = formData.get('special_requests') as string | null;

  // Arrival details
  const arrivalDate = formData.get('arrival_date') as string | null;
  const arrivalTime = formData.get('arrival_time') as string | null;
  const arrivalLocation = formData.get('arrival_location') as string | null;
  const arrivalLocationType = formData.get('arrival_location_type') as string | null;
  const arrivalFlightTrainNumber = formData.get('arrival_flight_train_number') as string | null;
  const arrivalNeedsPickup = formData.get('arrival_needs_pickup') === 'true';
  const arrivalNotes = formData.get('arrival_notes') as string | null;

  // Departure details
  const departureDate = formData.get('departure_date') as string | null;
  const departureTime = formData.get('departure_time') as string | null;
  const departureLocation = formData.get('departure_location') as string | null;
  const departureLocationType = formData.get('departure_location_type') as string | null;
  const departureFlightTrainNumber = formData.get('departure_flight_train_number') as string | null;
  const departureNeedsDropoff = formData.get('departure_needs_dropoff') === 'true';
  const departureNotes = formData.get('departure_notes') as string | null;

  // Accommodation
  const needsAccommodation = formData.get('needs_accommodation') === 'true';
  const accommodationCheckIn = formData.get('accommodation_check_in') as string | null;
  const accommodationCheckOut = formData.get('accommodation_check_out') as string | null;
  const accommodationPreferences = formData.get('accommodation_preferences') as string | null;

  // Check if this is an update to existing guest or new guest
  const { data: existingGuest } = await supabase
    .from('guests')
    .select('id, event_id')
    .eq('invitation_token', invitationToken)
    .single();

  if (existingGuest) {
    // Update existing guest
    const { data, error } = await supabase
      .from('guests')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        rsvp_status: rsvpStatus,
        rsvp_responded_at: new Date().toISOString(),
        number_of_guests: numberOfGuests,
        guest_names: guestNames,
        dietary_requirements: dietaryRequirements,
        accessibility_needs: accessibilityNeeds,
        special_requests: specialRequests,
        arrival_date: arrivalDate,
        arrival_time: arrivalTime,
        arrival_location: arrivalLocation,
        arrival_location_type: arrivalLocationType,
        arrival_flight_train_number: arrivalFlightTrainNumber,
        arrival_needs_pickup: arrivalNeedsPickup,
        arrival_notes: arrivalNotes,
        departure_date: departureDate,
        departure_time: departureTime,
        departure_location: departureLocation,
        departure_location_type: departureLocationType,
        departure_flight_train_number: departureFlightTrainNumber,
        departure_needs_dropoff: departureNeedsDropoff,
        departure_notes: departureNotes,
        needs_accommodation: needsAccommodation,
        accommodation_check_in: accommodationCheckIn,
        accommodation_check_out: accommodationCheckOut,
        accommodation_preferences: accommodationPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq('invitation_token', invitationToken)
      .select();

    if (error) {
      console.error('Error updating guest RSVP:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to submit RSVP: ${error.message || 'Database error'}`);
    }

    if (!data || data.length === 0) {
      console.error('No rows updated for invitation token:', invitationToken);
      throw new Error('Failed to update RSVP - no matching guest found');
    }

    // Mark invitation as responded
    await supabase
      .from('guest_invitations')
      .update({
        has_responded: true,
        responded_at: new Date().toISOString(),
      })
      .eq('invitation_token', invitationToken);

    revalidatePath(`/events/${existingGuest.event_id}/guests`);
  } else {
    // This shouldn't happen if using invitation system properly
    throw new Error('Invalid invitation token');
  }
}

export async function sendGuestInvitation(invitationId: string, method: 'email' | 'sms' | 'whatsapp') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get invitation details
  const { data: invitation, error } = await supabase
    .from('guest_invitations')
    .select(`
      *,
      event:events(id, title, start_date, location),
      guest:guests(first_name, last_name)
    `)
    .eq('id', invitationId)
    .single();

  if (error || !invitation) {
    throw new Error('Invitation not found');
  }

  // Generate invitation URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/rsvp/${invitation.invitation_token}`;

  // Update invitation with sent status
  await supabase
    .from('guest_invitations')
    .update({
      sent_at: new Date().toISOString(),
      sent_via: method,
    })
    .eq('id', invitationId);

  // TODO: Integrate with email/SMS service (Resend, Twilio, etc.)
  // For now, just return the URL
  return {
    success: true,
    invitationUrl,
    message: `Invitation would be sent via ${method}`,
  };
}

export async function getEventInvitations(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guest_invitations')
    .select(`
      *,
      guest:guests(id, first_name, last_name, email, phone, rsvp_status)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }

  return data;
}
