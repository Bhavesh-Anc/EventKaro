import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GuestsClient } from '@/components/features/guests-client';
import type { FamilyCardData } from '@/components/features/family-card';
import type { FamilyMember } from '@/components/features/family-detail-drawer';
import type { IndividualGuest } from '@/components/features/individuals-view';
import type { LogisticsGuest, HotelAssignment, PickupAssignment } from '@/components/features/logistics-view';
import { calculateGuestCosts } from '@/lib/guest-calculations';

export default async function GuestsPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Get wedding event for this organization
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('id')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .limit(1);

  const eventId = weddingEvents?.[0]?.id;

  if (!eventId) {
    redirect('/events/new');
  }

  // Fetch all family groups with their data
  const { data: familyGroups } = await supabase
    .from('wedding_family_groups')
    .select('*')
    .eq('event_id', eventId)
    .order('family_name');

  // Fetch all guests for this event
  const { data: allGuests } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('name');

  // Transform family groups to FamilyCardData
  const families: FamilyCardData[] = (familyGroups || []).map((fg: any) => ({
    id: fg.id,
    family_name: fg.family_name,
    family_side: fg.family_side,
    total_members: fg.total_members || 0,
    members_confirmed: fg.members_confirmed || 0,
    members_pending: fg.members_pending || 0,
    members_declined: fg.members_declined || 0,
    is_outstation: fg.is_outstation || false,
    rooms_required: fg.rooms_required || 0,
    rooms_allocated: fg.rooms_allocated || 0,
    pickup_required: fg.pickup_required || false,
    pickup_assigned: fg.pickup_assigned || false,
    is_vip: fg.is_vip || false,
    primary_contact_name: fg.primary_contact_name,
    primary_contact_phone: fg.primary_contact_phone,
  }));

  // Build family members map
  const familyMembers: Record<string, FamilyMember[]> = {};
  (allGuests || []).forEach((guest: any) => {
    if (guest.guest_group_id) {
      if (!familyMembers[guest.guest_group_id]) {
        familyMembers[guest.guest_group_id] = [];
      }
      familyMembers[guest.guest_group_id].push({
        id: guest.id,
        name: guest.name || `${guest.first_name} ${guest.last_name || ''}`.trim(),
        age: guest.age,
        rsvp_status: guest.rsvp_status || 'pending',
        dietary_restrictions: guest.dietary_restrictions,
        is_elderly: guest.is_elderly || false,
        is_child: guest.is_child || false,
        is_vip: guest.is_vip || false,
      });
    }
  });

  // Build individuals view data
  const individuals: IndividualGuest[] = (allGuests || []).map((guest: any) => {
    const family = familyGroups?.find((fg: any) => fg.id === guest.guest_group_id);
    return {
      id: guest.id,
      name: guest.name || `${guest.first_name} ${guest.last_name || ''}`.trim(),
      family_name: family?.family_name || 'Unknown',
      family_side: family?.family_side || 'bride',
      rsvp_status: guest.rsvp_status || 'pending',
      is_outstation: guest.is_outstation || false,
      hotel_assigned: family?.rooms_allocated > 0,
      pickup_assigned: family?.pickup_assigned || false,
      is_vip: guest.is_vip || false,
      is_elderly: guest.is_elderly || false,
      is_child: guest.is_child || false,
      dietary_restrictions: guest.dietary_restrictions,
      phone: guest.phone,
    };
  });

  // Build logistics view data
  const hotelAssignments: HotelAssignment[] = [];
  const pickupAssignments: PickupAssignment[] = [];
  const guestsNeedingHotel: LogisticsGuest[] = [];
  const guestsNeedingPickup: LogisticsGuest[] = [];

  // Group by hotel
  const hotelMap = new Map<string, any[]>();
  (familyGroups || []).forEach((fg: any) => {
    if (fg.hotel_name && fg.rooms_allocated > 0) {
      if (!hotelMap.has(fg.hotel_name)) {
        hotelMap.set(fg.hotel_name, []);
      }
      const members = familyMembers[fg.id] || [];
      members.forEach((member) => {
        hotelMap.get(fg.hotel_name)!.push({
          id: member.id,
          name: member.name,
          family_name: fg.family_name,
          family_id: fg.id,
          family_side: fg.family_side,
        });
      });
    }
  });

  hotelMap.forEach((guests, hotelName) => {
    hotelAssignments.push({
      hotel_name: hotelName,
      guests,
      rooms_allocated: guests.length,
      total_capacity: guests.length,
    });
  });

  // Find guests needing hotel
  (familyGroups || []).forEach((fg: any) => {
    if (fg.is_outstation && fg.rooms_required > fg.rooms_allocated) {
      const members = familyMembers[fg.id] || [];
      members.forEach((member) => {
        guestsNeedingHotel.push({
          id: member.id,
          name: member.name,
          family_name: fg.family_name,
          family_id: fg.id,
          family_side: fg.family_side,
          phone: fg.primary_contact_phone,
        });
      });
    }
  });

  // Find guests needing pickup
  (familyGroups || []).forEach((fg: any) => {
    if (fg.pickup_required && !fg.pickup_assigned) {
      const members = familyMembers[fg.id] || [];
      members.forEach((member) => {
        guestsNeedingPickup.push({
          id: member.id,
          name: member.name,
          family_name: fg.family_name,
          family_id: fg.id,
          family_side: fg.family_side,
          phone: fg.primary_contact_phone,
        });
      });
    }
  });

  // Calculate cost impact per family
  const costImpact: Record<string, any> = {};
  families.forEach((family) => {
    const memberCount = family.total_members;
    const costs = calculateGuestCosts(memberCount, {
      cateringPerHead: 1500,
      roomsNeeded: family.rooms_required,
      roomCostPerNight: 4000,
      transportSeats: family.pickup_required ? memberCount : 0,
      transportCostPerSeat: 500,
    });
    costImpact[family.id] = costs;
  });

  // RSVP history (placeholder - would need a separate table)
  const rsvpHistory: Record<string, any[]> = {};

  return (
    <GuestsClient
      families={families}
      individuals={individuals}
      logistics={{
        hotelAssignments,
        pickupAssignments,
        guestsNeedingHotel,
        guestsNeedingPickup,
      }}
      familyMembers={familyMembers}
      rsvpHistory={rsvpHistory}
      costImpact={costImpact}
      eventId={eventId}
    />
  );
}
