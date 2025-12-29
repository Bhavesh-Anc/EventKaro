'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function addGuest(formData: FormData) {
  const supabase = await createClient();

  const eventId = formData.get('event_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string || null;
  const email = formData.get('email') as string || null;
  const phone = formData.get('phone') as string || null;
  const groupId = formData.get('guest_group_id') as string || null;
  const plusOneAllowed = formData.get('plus_one_allowed') === 'on';

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
    attending: guests.filter((g) => g.rsvp_status === 'attending').length,
    notAttending: guests.filter((g) => g.rsvp_status === 'not_attending').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    maybe: guests.filter((g) => g.rsvp_status === 'maybe').length,
  };

  // Count plus ones
  const plusOnesAttending = guests.filter(
    (g) => g.plus_one_rsvp === 'attending'
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

  const { error } = await supabase
    .from('guests')
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      guest_group_id: groupId,
      notes,
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

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
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
      const values = lines[i].split(',').map((v) => v.trim());
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
  const is_vip = formData.get('is_vip') === 'true';

  if (!family_name || !family_side || !event_id) {
    return { error: 'Family name, side, and event are required' };
  }

  const { data, error } = await supabase
    .from('wedding_family_groups')
    .insert({
      event_id,
      family_name,
      family_side,
      primary_contact_name,
      primary_contact_phone,
      is_vip,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating family:', error);
    return { error: 'Failed to create family' };
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
  const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
  const dietary_restrictions = formData.get('dietary_restrictions') as string;
  const is_elderly = formData.get('is_elderly') === 'true';
  const is_child = formData.get('is_child') === 'true';
  const is_vip = formData.get('is_vip') === 'true';

  if (!family_id || !event_id || !name) {
    return { error: 'Family, event, and name are required' };
  }

  const { data, error } = await supabase
    .from('guests')
    .insert({
      guest_group_id: family_id,
      event_id,
      name,
      age,
      dietary_restrictions,
      is_elderly,
      is_child,
      is_vip,
      rsvp_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding family member:', error);
    return { error: 'Failed to add family member' };
  }

  // Update family member counts
  await updateFamilyMemberCounts(family_id);

  revalidatePath('/guests');
  return { success: true, member: data };
}

/**
 * Update RSVP status with cutoff tracking
 */
export async function updateFamilyMemberRSVP(
  guestId: string,
  status: 'pending' | 'confirmed' | 'declined' | 'maybe',
  rsvpCutoffDate?: string
) {
  const supabase = await createClient();

  // Check if this is a late confirmation
  const isLate = rsvpCutoffDate
    ? new Date() > new Date(rsvpCutoffDate) && status === 'confirmed'
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

  // Update family member counts
  if (data.guest_group_id) {
    await updateFamilyMemberCounts(data.guest_group_id);
  }

  revalidatePath('/guests');
  return { success: true, guest: data, isLate };
}

/**
 * Bulk update RSVP status for multiple guests
 */
export async function bulkUpdateFamilyRSVP(
  guestIds: string[],
  status: 'pending' | 'confirmed' | 'declined' | 'maybe'
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
async function updateFamilyMemberCounts(familyId: string) {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('guest_group_id', familyId);

  if (!members) return;

  const confirmed = members.filter((m) => m.rsvp_status === 'confirmed').length;
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
    .eq('id', familyId);
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
