'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Parse a CSV line properly handling quoted fields
 * Handles: commas inside quotes, escaped quotes, newlines in quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

export async function addGuest(formData: FormData) {
  const supabase = await createClient();

  const eventId = formData.get('event_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string || null;
  const email = formData.get('email') as string || null;
  const phone = formData.get('phone') as string || null;
  const groupId = formData.get('guest_group_id') as string || null;
  const plusOneAllowed = formData.get('plus_one_allowed') === 'on';

  // New enhanced fields
  const relationship = formData.get('relationship') as string || null;
  const relationshipDetail = formData.get('relationship_detail') as string || null;
  const ageGroup = formData.get('age_group') as string || null;
  const priority = formData.get('priority') as string || 'standard';
  const whatsappNumber = formData.get('whatsapp_number') as string || null;
  const preferredContact = formData.get('preferred_contact') as string || 'email';
  const notes = formData.get('notes') as string || null;

  const { error } = await supabase
    .from('guests')
    .insert({
      event_id: eventId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      guest_group_id: groupId,
      plus_one_allowed: plusOneAllowed,
      source: 'manual',
      // New fields
      relationship,
      relationship_detail: relationshipDetail,
      age_group: ageGroup,
      priority,
      whatsapp_number: whatsappNumber,
      preferred_contact: preferredContact,
      notes,
    });

  if (error) {
    console.error('Error adding guest:', error);
  }

  revalidatePath(`/events/${eventId}/guests`);
  redirect(`/events/${eventId}/guests`);
}

export async function getEventGuests(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select(`
      *,
      guest_group:guest_groups(id, name),
      dietary_preferences:guest_dietary_preferences(preference, notes)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function updateGuestRSVP(guestId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .update({
      rsvp_status: status,
      rsvp_date: new Date().toISOString(),
    })
    .eq('id', guestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events/*/guests');
  return { success: true };
}

export async function addDietaryPreference(
  guestId: string,
  preference: string,
  notes?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guest_dietary_preferences')
    .insert({
      guest_id: guestId,
      preference,
      notes,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events/*/guests');
  return { success: true };
}

export async function createGuestGroup(formData: FormData) {
  const supabase = await createClient();

  const eventId = formData.get('event_id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string || null;
  const groupType = formData.get('group_type') as string;

  const { error } = await supabase
    .from('guest_groups')
    .insert({
      event_id: eventId,
      name,
      description,
      group_type: groupType,
    });

  if (error) {
    console.error('Error creating guest group:', error);
  }

  revalidatePath(`/events/${eventId}/guests`);
  redirect(`/events/${eventId}/guests`);
}

export async function getEventGuestGroups(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guest_groups')
    .select('*')
    .eq('event_id', eventId)
    .order('name');

  if (error) return [];
  return data;
}

export async function getGuestStats(eventId: string) {
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from('guests')
    .select('rsvp_status, plus_one_rsvp')
    .eq('event_id', eventId);

  if (!guests) return {
    total: 0,
    attending: 0,
    notAttending: 0,
    pending: 0,
    maybe: 0,
    plusOnesAttending: 0,
    totalExpected: 0,
  };

  const stats = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvp_status === 'accepted').length,
    notAttending: guests.filter((g) => g.rsvp_status === 'declined').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    maybe: guests.filter((g) => g.rsvp_status === 'maybe').length,
  };

  // Count plus ones
  const plusOnesAttending = guests.filter(
    (g) => g.plus_one_rsvp === 'accepted'
  ).length;

  return {
    ...stats,
    plusOnesAttending,
    totalExpected: stats.attending + plusOnesAttending,
  };
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', guestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events/*/guests');
  return { success: true };
}

export async function getGuest(guestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guests')
    .select(`
      *,
      guest_group:guest_groups(id, name, group_type),
      dietary_preferences:guest_dietary_preferences(id, preference, notes)
    `)
    .eq('id', guestId)
    .single();

  if (error) return null;
  return data;
}

export async function updateGuest(formData: FormData) {
  const supabase = await createClient();

  const guestId = formData.get('guest_id') as string;
  const eventId = formData.get('event_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string || null;
  const email = formData.get('email') as string || null;
  const phone = formData.get('phone') as string || null;
  const groupId = formData.get('guest_group_id') as string || null;
  const notes = formData.get('notes') as string || null;

  // Enhanced fields
  const relationship = formData.get('relationship') as string || null;
  const relationshipDetail = formData.get('relationship_detail') as string || null;
  const ageGroup = formData.get('age_group') as string || null;
  const priority = formData.get('priority') as string || null;
  const whatsappNumber = formData.get('whatsapp_number') as string || null;
  const preferredContact = formData.get('preferred_contact') as string || null;

  const { error } = await supabase
    .from('guests')
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      guest_group_id: groupId,
      notes,
      // Enhanced fields
      relationship,
      relationship_detail: relationshipDetail,
      age_group: ageGroup,
      priority,
      whatsapp_number: whatsappNumber,
      preferred_contact: preferredContact,
    })
    .eq('id', guestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/guests/${guestId}`);
  return { success: true };
}

export async function updatePlusOne(formData: FormData) {
  const supabase = await createClient();

  const guestId = formData.get('guest_id') as string;
  const eventId = formData.get('event_id') as string;
  const plusOneAllowed = formData.get('plus_one_allowed') === 'on';
  const plusOneName = formData.get('plus_one_name') as string || null;
  const plusOneRsvp = formData.get('plus_one_rsvp') as string || null;

  const { error } = await supabase
    .from('guests')
    .update({
      plus_one_allowed: plusOneAllowed,
      plus_one_name: plusOneName,
      plus_one_rsvp: plusOneRsvp,
    })
    .eq('id', guestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/guests/${guestId}`);
  return { success: true };
}

export async function removeDietaryPreference(
  guestId: string,
  preference: string,
  eventId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guest_dietary_preferences')
    .delete()
    .eq('guest_id', guestId)
    .eq('preference', preference);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/guests/${guestId}`);
  return { success: true };
}

export async function toggleCheckIn(guestId: string, eventId: string) {
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from('guests')
    .select('checked_in')
    .eq('id', guestId)
    .single();

  const { error } = await supabase
    .from('guests')
    .update({
      checked_in: !guest?.checked_in,
      checked_in_at: !guest?.checked_in ? new Date().toISOString() : null,
    })
    .eq('id', guestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/guests/${guestId}`);
  return { success: true };
}

export async function importGuestsFromCSV(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get('file') as File;
  const eventId = formData.get('event_id') as string;

  if (!file) {
    return { error: 'No file provided', success: false };
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { error: 'Invalid file type. Please upload a CSV file.', success: false };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 5MB.', success: false };
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return { error: 'CSV file is empty or invalid', success: false };
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
    const requiredHeaders = ['first_name'];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return {
          error: `Missing required column: ${required}`,
          success: false,
        };
      }
    }

    // Get existing groups for this event
    const { data: existingGroups } = await supabase
      .from('guest_groups')
      .select('id, name')
      .eq('event_id', eventId);

    const groupMap = new Map(
      (existingGroups || []).map((g: any) => [g.name.toLowerCase(), g.id])
    );

    let imported = 0;
    let skipped = 0;

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });

      if (!row.first_name) {
        skipped++;
        continue;
      }

      // Handle group - create if doesn't exist
      let groupId = null;
      if (row.group_name) {
        const groupNameLower = row.group_name.toLowerCase();
        if (groupMap.has(groupNameLower)) {
          groupId = groupMap.get(groupNameLower);
        } else {
          const { data: newGroup } = await supabase
            .from('guest_groups')
            .insert({
              event_id: eventId,
              name: row.group_name,
              group_type: 'other',
            })
            .select()
            .single();

          if (newGroup) {
            groupId = newGroup.id;
            groupMap.set(groupNameLower, groupId);
          }
        }
      }

      // Check for duplicate email
      if (row.email) {
        const { data: existing } = await supabase
          .from('guests')
          .select('id')
          .eq('event_id', eventId)
          .eq('email', row.email)
          .single();

        if (existing) {
          skipped++;
          continue;
        }
      }

      // Parse plus_one_allowed
      const plusOneAllowed =
        row.plus_one_allowed === 'true' ||
        row.plus_one_allowed === '1' ||
        row.plus_one_allowed === 'TRUE' ||
        row.plus_one_allowed === 'yes';

      // Insert guest
      const { error } = await supabase.from('guests').insert({
        event_id: eventId,
        first_name: row.first_name,
        last_name: row.last_name || null,
        email: row.email || null,
        phone: row.phone || null,
        guest_group_id: groupId,
        plus_one_allowed: plusOneAllowed,
        source: 'imported',
      });

      if (error) {
        skipped++;
      } else {
        imported++;
      }
    }

    revalidatePath(`/events/${eventId}/guests`);
    return {
      success: true,
      imported,
      skipped,
    };
  } catch (error: any) {
    return {
      error: `Failed to process CSV: ${error.message}`,
      success: false,
    };
  }
}

// ============================================================================
// FAMILY-AWARE GUEST MANAGEMENT
// ============================================================================

/**
 * Create a new family group
 */
export async function createFamily(formData: FormData) {
  const supabase = await createClient();

  const family_name = formData.get('family_name') as string;
  const family_side = formData.get('family_side') as string;
  const event_id = formData.get('event_id') as string;
  const primary_contact_name = formData.get('primary_contact_name') as string;
  const primary_contact_phone = formData.get('primary_contact_phone') as string;

  if (!family_name || !family_side || !event_id) {
    return { error: 'Family name, side, and event are required' };
  }

  const { data, error } = await supabase
    .from('wedding_family_groups')
    .insert({
      event_id,
      family_name,
      family_side,
      primary_contact_name: primary_contact_name || null,
      primary_contact_phone: primary_contact_phone || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating family:', error);
    return { error: `Failed to create family: ${error.message}` };
  }

  revalidatePath('/guests');
  return { success: true, family: data };
}

/**
 * Add a family member
 */
export async function addFamilyMember(formData: FormData) {
  const supabase = await createClient();

  const family_id = formData.get('family_id') as string;
  const event_id = formData.get('event_id') as string;
  const name = formData.get('name') as string;
  const is_elderly = formData.get('is_elderly') === 'true';
  const is_child = formData.get('is_child') === 'true';

  if (!family_id || !event_id || !name) {
    return { error: 'Family, event, and name are required' };
  }

  // Split name into first and last name
  const nameParts = name.trim().split(' ');
  const first_name = nameParts[0];
  const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

  // Get the family details to set family_group_name (for trigger compatibility)
  const { data: family } = await supabase
    .from('wedding_family_groups')
    .select('family_name, family_side')
    .eq('id', family_id)
    .single();

  if (!family) {
    return { error: 'Family not found' };
  }

  // Insert guest - use family_group_name to link to wedding_family_groups
  // Don't use guest_group_id as it references the separate guest_groups table
  const { data, error } = await supabase
    .from('guests')
    .insert({
      event_id,
      first_name,
      last_name,
      family_group_name: family.family_name,
      family_side: family.family_side,
      is_elderly,
      is_child,
      rsvp_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding family member:', error);
    return { error: `Failed to add family member: ${error.message}` };
  }

  // The database trigger update_family_group_counts() handles updating counts
  // But we'll also manually update to ensure consistency
  await updateFamilyMemberCounts(family.family_name, event_id);

  revalidatePath('/guests');
  return { success: true, member: data };
}

/**
 * Update RSVP status with cutoff tracking
 */
export async function updateFamilyMemberRSVP(
  guestId: string,
  status: 'pending' | 'accepted' | 'declined' | 'maybe',
  rsvpCutoffDate?: string
) {
  const supabase = await createClient();

  // Check if this is a late confirmation
  const isLate = rsvpCutoffDate
    ? new Date() > new Date(rsvpCutoffDate) && status === 'accepted'
    : false;

  const { data, error } = await supabase
    .from('guests')
    .update({
      rsvp_status: status,
      rsvp_updated_at: new Date().toISOString(),
    })
    .eq('id', guestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating RSVP:', error);
    return { error: 'Failed to update RSVP' };
  }

  // Update family member counts (for wedding families linked via family_group_name)
  if (data.family_group_name && data.event_id) {
    await updateFamilyMemberCounts(data.family_group_name, data.event_id);
  }

  revalidatePath('/guests');
  return { success: true, guest: data, isLate };
}

/**
 * Bulk update RSVP status for multiple guests
 */
export async function bulkUpdateFamilyRSVP(
  guestIds: string[],
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guests')
    .update({
      rsvp_status: status,
      rsvp_updated_at: new Date().toISOString(),
    })
    .in('id', guestIds);

  if (error) {
    console.error('Error bulk updating RSVP:', error);
    return { error: 'Failed to update RSVPs' };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Assign hotel to a family
 */
export async function assignHotelToFamily(
  familyId: string,
  hotelName: string,
  roomsAllocated: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wedding_family_groups')
    .update({
      hotel_name: hotelName,
      rooms_allocated: roomsAllocated,
    })
    .eq('id', familyId);

  if (error) {
    console.error('Error assigning hotel:', error);
    return { error: 'Failed to assign hotel' };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Assign pickup/transport to a family
 */
export async function assignPickupToFamily(
  familyId: string,
  pickupTime: string,
  pickupLocation: string,
  vehicleType?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wedding_family_groups')
    .update({
      pickup_assigned: true,
      pickup_time: pickupTime,
      pickup_location: pickupLocation,
      vehicle_type: vehicleType,
    })
    .eq('id', familyId);

  if (error) {
    console.error('Error assigning pickup:', error);
    return { error: 'Failed to assign pickup' };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Delete a family and all its members
 */
export async function deleteFamily(familyId: string) {
  const supabase = await createClient();

  // First delete all family members
  await supabase.from('guests').delete().eq('guest_group_id', familyId);

  // Then delete the family
  const { error } = await supabase
    .from('wedding_family_groups')
    .delete()
    .eq('id', familyId);

  if (error) {
    console.error('Error deleting family:', error);
    return { error: 'Failed to delete family' };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Update family member counts (helper function)
 */
async function updateFamilyMemberCounts(familyName: string, eventId: string) {
  const supabase = await createClient();

  // Query guests by family_group_name (links to wedding_family_groups.family_name)
  const { data: members } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('family_group_name', familyName)
    .eq('event_id', eventId);

  if (!members) return;

  const confirmed = members.filter((m) => m.rsvp_status === 'accepted').length;
  const pending = members.filter((m) => m.rsvp_status === 'pending').length;
  const declined = members.filter((m) => m.rsvp_status === 'declined').length;

  await supabase
    .from('wedding_family_groups')
    .update({
      total_members: members.length,
      members_confirmed: confirmed,
      members_pending: pending,
      members_declined: declined,
    })
    .eq('family_name', familyName)
    .eq('event_id', eventId);
}

/**
 * Send RSVP reminder via WhatsApp (returns WhatsApp URL)
 */
export async function sendRSVPReminder(
  familyId: string,
  eventName: string,
  eventDate: string
) {
  const supabase = await createClient();

  const { data: family } = await supabase
    .from('wedding_family_groups')
    .select('family_name, primary_contact_phone')
    .eq('id', familyId)
    .single();

  if (!family || !family.primary_contact_phone) {
    return { error: 'No phone number found for this family' };
  }

  const message = `Hi ${family.family_name} family!

This is a friendly reminder to confirm your attendance for ${eventName} on ${eventDate}.

Please let us know at your earliest convenience. Looking forward to celebrating with you! 🎉`;

  const whatsappUrl = `https://wa.me/${family.primary_contact_phone.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(message)}`;

  return { success: true, whatsappUrl };
}

/**
 * Generate RSVP form link for a family member
 * Creates/updates invitation token and returns the RSVP URL
 */
export async function generateRSVPFormLink(guestId: string, eventId: string) {
  const supabase = await createClient();

  // Generate a secure random token
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  // Update guest with invitation token
  const { error } = await supabase
    .from('guests')
    .update({
      invitation_token: token,
      invitation_expires_at: expiresAt.toISOString(),
    })
    .eq('id', guestId);

  if (error) {
    console.error('Error generating RSVP link:', error);
    return { error: 'Failed to generate RSVP link' };
  }

  // Build the RSVP URL (relative, will be combined with origin on client)
  const rsvpUrl = `/rsvp/${token}`;

  return { success: true, rsvpUrl, token };
}

/**
 * Generate RSVP form links for all family members and return WhatsApp share URL
 */
export async function sendRSVPFormToFamily(
  familyId: string,
  eventId: string,
  eventName: string,
  eventDate: string,
  baseUrl: string
) {
  const supabase = await createClient();

  // Get family details
  const { data: family } = await supabase
    .from('wedding_family_groups')
    .select('family_name, primary_contact_phone')
    .eq('id', familyId)
    .single();

  if (!family) {
    return { error: 'Family not found' };
  }

  if (!family.primary_contact_phone) {
    return { error: 'No phone number found for this family' };
  }

  // Get all family members
  const { data: members } = await supabase
    .from('guests')
    .select('id, first_name, last_name')
    .eq('family_group_name', family.family_name)
    .eq('event_id', eventId);

  if (!members || members.length === 0) {
    return { error: 'No family members found' };
  }

  // Generate tokens for all members
  const memberLinks: { name: string; url: string }[] = [];

  for (const member of members) {
    const result = await generateRSVPFormLink(member.id, eventId);
    if (result.success && result.rsvpUrl) {
      const name = `${member.first_name || ''} ${member.last_name || ''}`.trim();
      memberLinks.push({
        name: name || 'Guest',
        url: `${baseUrl}${result.rsvpUrl}`,
      });
    }
  }

  if (memberLinks.length === 0) {
    return { error: 'Failed to generate RSVP links' };
  }

  // Build WhatsApp message with all member links
  let message = `Hi ${family.family_name} family! 🎉

You're invited to ${eventName} on ${eventDate}!

Please fill out the RSVP form for each family member:
`;

  memberLinks.forEach((link, index) => {
    message += `\n${index + 1}. ${link.name}: ${link.url}`;
  });

  message += `\n\nThe form includes travel and accommodation details. Looking forward to celebrating with you!`;

  const whatsappUrl = `https://wa.me/${family.primary_contact_phone.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(message)}`;

  return { success: true, whatsappUrl, memberLinks };
}

// ============================================================================
// PER-EVENT RSVP TRACKING
// ============================================================================

/**
 * Get all wedding events for per-event RSVP tracking
 */
export async function getWeddingEventsForRSVP(parentEventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_events')
    .select('id, event_name, custom_event_name, start_datetime, venue_name')
    .eq('parent_event_id', parentEventId)
    .order('sequence_order', { ascending: true });

  if (error) {
    console.error('Error fetching wedding events:', error);
    return [];
  }
  return data;
}

/**
 * Get per-event RSVP status for a guest
 */
export async function getGuestEventRSVPs(guestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('guest_event_rsvp')
    .select(`
      *,
      wedding_event:wedding_events(id, event_name, custom_event_name, start_datetime)
    `)
    .eq('guest_id', guestId);

  if (error) {
    console.error('Error fetching guest event RSVPs:', error);
    return [];
  }
  return data;
}

/**
 * Update RSVP status for a specific guest and wedding event
 */
export async function updateGuestEventRSVP(
  guestId: string,
  weddingEventId: string,
  status: 'pending' | 'accepted' | 'declined' | 'tentative',
  additionalData?: {
    dietaryPreference?: string;
    plusOneAttending?: boolean;
    transportationNeeded?: boolean;
    arrivalTime?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();

  const updateData: any = {
    rsvp_status: status,
    rsvp_date: new Date().toISOString(),
  };

  if (additionalData) {
    if (additionalData.dietaryPreference !== undefined) {
      updateData.dietary_preference = additionalData.dietaryPreference;
    }
    if (additionalData.plusOneAttending !== undefined) {
      updateData.plus_one_attending = additionalData.plusOneAttending;
    }
    if (additionalData.transportationNeeded !== undefined) {
      updateData.transportation_needed = additionalData.transportationNeeded;
    }
    if (additionalData.arrivalTime !== undefined) {
      updateData.arrival_time = additionalData.arrivalTime;
    }
    if (additionalData.notes !== undefined) {
      updateData.notes = additionalData.notes;
    }
  }

  // Upsert - insert if doesn't exist, update if does
  const { error } = await supabase
    .from('guest_event_rsvp')
    .upsert({
      guest_id: guestId,
      wedding_event_id: weddingEventId,
      ...updateData,
    }, {
      onConflict: 'guest_id,wedding_event_id',
    });

  if (error) {
    console.error('Error updating guest event RSVP:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  revalidatePath('/events');
  return { success: true };
}

/**
 * Bulk update per-event RSVPs for a guest (e.g., attending all events)
 */
export async function bulkUpdateGuestEventRSVPs(
  guestId: string,
  weddingEventIds: string[],
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
) {
  const supabase = await createClient();

  const updates = weddingEventIds.map(eventId => ({
    guest_id: guestId,
    wedding_event_id: eventId,
    rsvp_status: status,
    rsvp_date: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('guest_event_rsvp')
    .upsert(updates, {
      onConflict: 'guest_id,wedding_event_id',
    });

  if (error) {
    console.error('Error bulk updating guest event RSVPs:', error);
    return { error: error.message };
  }

  revalidatePath('/guests');
  return { success: true };
}

/**
 * Get event-wise RSVP stats for an event
 */
export async function getEventWiseRSVPStats(parentEventId: string) {
  const supabase = await createClient();

  // Get all wedding events
  const { data: weddingEvents } = await supabase
    .from('wedding_events')
    .select('id, event_name, custom_event_name, start_datetime')
    .eq('parent_event_id', parentEventId)
    .order('sequence_order', { ascending: true });

  if (!weddingEvents) return [];

  // Get RSVP counts for each event
  const statsPromises = weddingEvents.map(async (event) => {
    const { data: rsvps } = await supabase
      .from('guest_event_rsvp')
      .select('rsvp_status')
      .eq('wedding_event_id', event.id);

    const counts = {
      total: rsvps?.length || 0,
      accepted: rsvps?.filter(r => r.rsvp_status === 'accepted').length || 0,
      declined: rsvps?.filter(r => r.rsvp_status === 'declined').length || 0,
      pending: rsvps?.filter(r => r.rsvp_status === 'pending').length || 0,
      tentative: rsvps?.filter(r => r.rsvp_status === 'tentative').length || 0,
    };

    return {
      ...event,
      eventName: event.custom_event_name || event.event_name,
      ...counts,
    };
  });

  return Promise.all(statsPromises);
}

/**
 * Initialize per-event RSVPs for a guest across all wedding events
 */
export async function initializeGuestEventRSVPs(guestId: string, parentEventId: string) {
  const supabase = await createClient();

  // Get all wedding events
  const { data: weddingEvents } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('parent_event_id', parentEventId);

  if (!weddingEvents || weddingEvents.length === 0) return { success: true };

  // Create pending RSVP entries for all events
  const rsvpEntries = weddingEvents.map(event => ({
    guest_id: guestId,
    wedding_event_id: event.id,
    rsvp_status: 'pending',
  }));

  const { error } = await supabase
    .from('guest_event_rsvp')
    .upsert(rsvpEntries, {
      onConflict: 'guest_id,wedding_event_id',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('Error initializing guest event RSVPs:', error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get guest summary with per-event attendance
 */
export async function getGuestWithEventAttendance(guestId: string) {
  const supabase = await createClient();

  const { data: guest, error } = await supabase
    .from('guests')
    .select(`
      *,
      guest_event_rsvps:guest_event_rsvp(
        id,
        rsvp_status,
        rsvp_date,
        plus_one_attending,
        dietary_preference,
        transportation_needed,
        wedding_event:wedding_events(
          id,
          event_name,
          custom_event_name,
          start_datetime,
          venue_name
        )
      )
    `)
    .eq('id', guestId)
    .single();

  if (error) {
    console.error('Error fetching guest with event attendance:', error);
    return null;
  }

  return guest;
}

/**
 * Get age group statistics for catering planning
 */
export async function getAgeGroupStats(eventId: string) {
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from('guests')
    .select('age_group, rsvp_status')
    .eq('event_id', eventId);

  if (!guests) return {
    child: { total: 0, attending: 0 },
    teen: { total: 0, attending: 0 },
    adult: { total: 0, attending: 0 },
    senior: { total: 0, attending: 0 },
    unknown: { total: 0, attending: 0 },
  };

  const stats: Record<string, { total: number; attending: number }> = {
    child: { total: 0, attending: 0 },
    teen: { total: 0, attending: 0 },
    adult: { total: 0, attending: 0 },
    senior: { total: 0, attending: 0 },
    unknown: { total: 0, attending: 0 },
  };

  guests.forEach(guest => {
    const group = guest.age_group || 'unknown';
    if (stats[group]) {
      stats[group].total++;
      if (guest.rsvp_status === 'accepted') {
        stats[group].attending++;
      }
    }
  });

  return stats;
}

/**
 * Get relationship breakdown for guest list
 */
export async function getRelationshipStats(eventId: string) {
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from('guests')
    .select('relationship, priority, rsvp_status')
    .eq('event_id', eventId);

  if (!guests) return {};

  const stats: Record<string, { total: number; attending: number; byPriority: Record<string, number> }> = {};

  guests.forEach(guest => {
    const rel = guest.relationship || 'other';
    if (!stats[rel]) {
      stats[rel] = { total: 0, attending: 0, byPriority: {} };
    }
    stats[rel].total++;
    if (guest.rsvp_status === 'accepted') {
      stats[rel].attending++;
    }
    const priority = guest.priority || 'standard';
    stats[rel].byPriority[priority] = (stats[rel].byPriority[priority] || 0) + 1;
  });

  return stats;
}

/**
 * Import families and members from CSV
 *
 * CSV Format:
 * family_name, family_side, primary_contact_name, primary_contact_phone,
 * member_name, member_age, is_elderly, is_child, is_vip, dietary_restrictions,
 * is_outstation, rooms_required, pickup_required
 */
export async function importFamiliesFromCSV(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get('file') as File;
  const eventId = formData.get('event_id') as string;

  if (!file) {
    return { error: 'No file provided', success: false };
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { error: 'Invalid file type. Please upload a CSV file.', success: false };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 5MB.', success: false };
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      return { error: 'CSV file is empty or invalid', success: false };
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
    const requiredHeaders = ['family_name', 'family_side', 'member_name'];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return {
          error: `Missing required column: ${required}`,
          success: false,
        };
      }
    }

    // Track families created
    const familyMap = new Map<string, string>(); // family_name -> family_id
    let imported = 0;
    let skipped = 0;

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });

      if (!row.family_name || !row.family_side || !row.member_name) {
        skipped++;
        continue;
      }

      // Normalize family side
      const familySide = row.family_side.toLowerCase();
      if (familySide !== 'bride' && familySide !== 'groom') {
        skipped++;
        continue;
      }

      // Create or get family
      let familyId: string | undefined = familyMap.get(row.family_name);

      if (!familyId) {
        // Create new family
        const { data: newFamily, error: familyError } = await supabase
          .from('wedding_family_groups')
          .insert({
            event_id: eventId,
            family_name: row.family_name,
            family_side: familySide,
            primary_contact_name: row.primary_contact_name || null,
            primary_contact_phone: row.primary_contact_phone || null,
            is_outstation: row.is_outstation === 'true' || row.is_outstation === '1',
            rooms_required: parseInt(row.rooms_required) || 0,
            pickup_required: row.pickup_required === 'true' || row.pickup_required === '1',
          })
          .select()
          .single();

        if (familyError || !newFamily || !newFamily.id) {
          console.error('Error creating family:', familyError);
          skipped++;
          continue;
        }

        familyId = newFamily.id;
        familyMap.set(row.family_name, newFamily.id);
      }

      // Skip if still no family ID (shouldn't happen, but safety check)
      if (!familyId) {
        skipped++;
        continue;
      }

      // Add family member - parse name into first_name and last_name
      const nameParts = (row.member_name || '').trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error: memberError } = await supabase
        .from('guests')
        .insert({
          event_id: eventId,
          family_group_name: row.family_name, // Links to wedding_family_groups via trigger
          family_side: row.family_side || null,
          first_name: firstName,
          last_name: lastName,
          is_elderly: row.is_elderly === 'true' || row.is_elderly === '1',
          is_child: row.is_child === 'true' || row.is_child === '1',
          rsvp_status: 'pending',
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
        skipped++;
      } else {
        imported++;
      }
    }

    // Update member counts for all families (using family name and event ID)
    for (const [familyName] of familyMap.entries()) {
      await updateFamilyMemberCounts(familyName, eventId);
    }

    revalidatePath('/guests');
    return {
      success: true,
      imported: familyMap.size,
      skipped,
    };
  } catch (error: any) {
    return {
      error: `Failed to process CSV: ${error.message}`,
      success: false,
    };
  }
}
