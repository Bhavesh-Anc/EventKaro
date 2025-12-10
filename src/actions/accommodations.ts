'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function addAccommodation(formData: FormData) {
  const supabase = await createClient();

  const eventId = formData.get('event_id') as string;
  const hotelName = formData.get('hotel_name') as string;
  const hotelAddress = formData.get('hotel_address') as string || null;
  const hotelPhone = formData.get('hotel_phone') as string || null;
  const contactPerson = formData.get('contact_person') as string || null;
  const totalRooms = parseInt(formData.get('total_rooms_blocked') as string) || 0;
  const checkInDate = formData.get('check_in_date') as string || null;
  const checkOutDate = formData.get('check_out_date') as string || null;
  const notes = formData.get('notes') as string || null;

  const { error } = await supabase
    .from('accommodations')
    .insert({
      event_id: eventId,
      hotel_name: hotelName,
      hotel_address: hotelAddress,
      hotel_phone: hotelPhone,
      contact_person: contactPerson,
      total_rooms_blocked: totalRooms,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      notes,
    });

  if (error) {
    console.error('Error adding accommodation:', error);
    // In production, you'd want to handle this better
  }

  revalidatePath(`/events/${eventId}/accommodations`);
  redirect(`/events/${eventId}/accommodations`);
}

export async function getEventAccommodations(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('accommodations')
    .select(`
      *,
      guest_accommodations(id)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) return [];

  // Count rooms assigned for each accommodation
  return (data || []).map((acc: any) => ({
    ...acc,
    rooms_assigned: acc.guest_accommodations?.length || 0,
  }));
}

export async function getAccommodation(accommodationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('accommodations')
    .select(`
      *,
      guest_accommodations(
        id,
        room_number,
        room_type,
        notes,
        guest:guests(id, first_name, last_name, email, phone)
      )
    `)
    .eq('id', accommodationId)
    .single();

  if (error) return null;
  return data;
}

export async function updateAccommodation(formData: FormData) {
  const supabase = await createClient();

  const accommodationId = formData.get('accommodation_id') as string;
  const eventId = formData.get('event_id') as string;
  const hotelName = formData.get('hotel_name') as string;
  const hotelAddress = formData.get('hotel_address') as string || null;
  const hotelPhone = formData.get('hotel_phone') as string || null;
  const contactPerson = formData.get('contact_person') as string || null;
  const totalRooms = parseInt(formData.get('total_rooms_blocked') as string) || 0;
  const checkInDate = formData.get('check_in_date') as string || null;
  const checkOutDate = formData.get('check_out_date') as string || null;
  const notes = formData.get('notes') as string || null;

  const { error } = await supabase
    .from('accommodations')
    .update({
      hotel_name: hotelName,
      hotel_address: hotelAddress,
      hotel_phone: hotelPhone,
      contact_person: contactPerson,
      total_rooms_blocked: totalRooms,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      notes,
    })
    .eq('id', accommodationId);

  if (error) {
    console.error('Error updating accommodation:', error);
  }

  revalidatePath(`/events/${eventId}/accommodations`);
  revalidatePath(`/events/${eventId}/accommodations/${accommodationId}`);
  redirect(`/events/${eventId}/accommodations/${accommodationId}`);
}

export async function deleteAccommodation(accommodationId: string, eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('accommodations')
    .delete()
    .eq('id', accommodationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/accommodations`);
  return { success: true };
}

export async function assignGuestToRoom(formData: FormData) {
  const supabase = await createClient();

  const guestId = formData.get('guest_id') as string;
  const accommodationId = formData.get('accommodation_id') as string;
  const eventId = formData.get('event_id') as string;
  const roomNumber = formData.get('room_number') as string || null;
  const roomType = formData.get('room_type') as string || null;
  const notes = formData.get('notes') as string || null;

  const { error } = await supabase
    .from('guest_accommodations')
    .insert({
      guest_id: guestId,
      accommodation_id: accommodationId,
      room_number: roomNumber,
      room_type: roomType,
      notes,
    });

  if (error) {
    console.error('Error assigning guest to room:', error);
  }

  revalidatePath(`/events/${eventId}/accommodations/${accommodationId}`);
  revalidatePath(`/events/${eventId}/guests/${guestId}`);
}

export async function removeGuestFromRoom(guestAccommodationId: string, eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('guest_accommodations')
    .delete()
    .eq('id', guestAccommodationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/accommodations`);
  return { success: true };
}

export async function getUnassignedGuests(eventId: string) {
  const supabase = await createClient();

  // Get all guests for the event
  const { data: allGuests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, email, phone')
    .eq('event_id', eventId)
    .eq('rsvp_status', 'attending');

  // Get guests already assigned to rooms
  const { data: assignedGuests } = await supabase
    .from('guest_accommodations')
    .select('guest_id')
    .in('guest_id', (allGuests || []).map((g: any) => g.id));

  const assignedGuestIds = new Set((assignedGuests || []).map((a: any) => a.guest_id));

  // Filter out assigned guests
  return (allGuests || []).filter((guest: any) => !assignedGuestIds.has(guest.id));
}
