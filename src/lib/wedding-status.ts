/**
 * Wedding Event Status Logic
 *
 * This determines the health of each wedding sub-event:
 * - ✅ READY: All critical items assigned, no conflicts
 * - ⚠️ ATTENTION: Missing critical assignments
 * - 🔴 CONFLICT: Overlapping vendors/transport or timing issues
 */

export type EventStatus = 'ready' | 'attention' | 'conflict';

export interface EventStatusDetails {
  status: EventStatus;
  issues: string[];
  conflicts: string[];
}

export interface WeddingEventData {
  id: string;
  event_name: string;
  custom_event_name?: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  duration_minutes?: number;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  venue_type?: string;
  expected_guest_count?: number;
  guest_subset?: string;
  dress_code?: string;
  color_theme?: string;
  transport_required?: boolean;
  vendor_assignments?: {
    id: string;
    status: string;
    scope?: string;
    arrival_time?: string;
    vendor_profiles?: {
      id: string;
      business_name: string;
      category: string;
      contact_phone?: string;
      contact_email?: string;
    };
  }[];
  budget?: {
    id: string;
    allocated_amount: number;
    spent_amount: number;
    committed_amount: number;
  };
  budget_allocated?: number;
  has_transport?: boolean;
  transport_assigned?: boolean;
  status?: string;
}

/**
 * Calculate the status of a wedding event
 */
export function calculateEventStatus(
  event: WeddingEventData,
  allEvents: WeddingEventData[] = []
): EventStatusDetails {
  const issues: string[] = [];
  const conflicts: string[] = [];

  // Check for conflicts first (highest priority)
  const eventConflicts = detectConflicts(event, allEvents);
  conflicts.push(...eventConflicts);

  if (conflicts.length > 0) {
    return {
      status: 'conflict',
      issues,
      conflicts,
    };
  }

  // Check for missing critical items

  // 1. Guest subset
  if (!event.guest_subset || event.expected_guest_count === 0) {
    issues.push('Guest subset not defined');
  }

  // 2. Vendor assignments
  if (!event.vendor_assignments || event.vendor_assignments.length === 0) {
    issues.push('No vendors assigned');
  } else {
    // Check if vendors are confirmed
    const unconfirmedVendors = event.vendor_assignments.filter(
      (va) => va.status !== 'confirmed'
    );
    if (unconfirmedVendors.length > 0) {
      issues.push(`${unconfirmedVendors.length} vendor(s) not confirmed`);
    }
  }

  // 3. Transport
  if (event.has_transport && !event.transport_assigned) {
    issues.push('Transport not assigned');
  }

  // 4. Budget
  if (!event.budget_allocated || event.budget_allocated === 0) {
    issues.push('Budget not set');
  }

  // 5. Venue
  if (!event.venue_name) {
    issues.push('Venue not specified');
  }

  // Determine final status
  if (issues.length > 0) {
    return {
      status: 'attention',
      issues,
      conflicts: [],
    };
  }

  return {
    status: 'ready',
    issues: [],
    conflicts: [],
  };
}

/**
 * Detect conflicts between events
 */
function detectConflicts(
  event: WeddingEventData,
  allEvents: WeddingEventData[]
): string[] {
  const conflicts: string[] = [];

  const eventStart = new Date(event.start_datetime);
  const eventEnd = new Date(event.end_datetime);

  for (const otherEvent of allEvents) {
    if (otherEvent.id === event.id) continue;

    const otherStart = new Date(otherEvent.start_datetime);
    const otherEnd = new Date(otherEvent.end_datetime);

    // Check time overlap
    const hasTimeOverlap =
      (eventStart >= otherStart && eventStart < otherEnd) ||
      (eventEnd > otherStart && eventEnd <= otherEnd) ||
      (eventStart <= otherStart && eventEnd >= otherEnd);

    if (hasTimeOverlap) {
      const otherEventName = otherEvent.custom_event_name || otherEvent.event_name;
      conflicts.push(`Overlaps with ${otherEventName}`);
      continue;
    }

    // Check vendor conflicts (same vendor, overlapping or not enough buffer)
    if (event.vendor_assignments && otherEvent.vendor_assignments) {
      const eventVendorIds = event.vendor_assignments.map((va) => va.id);
      const otherVendorIds = otherEvent.vendor_assignments.map((va) => va.id);

      const sharedVendors = eventVendorIds.filter((id) =>
        otherVendorIds.includes(id)
      );

      if (sharedVendors.length > 0) {
        // Check if there's enough buffer time (at least 2 hours)
        const bufferMinutes = 120;
        const timeBetween = Math.abs(
          (eventStart.getTime() - otherEnd.getTime()) / 1000 / 60
        );

        if (timeBetween < bufferMinutes) {
          const vendorNames = event.vendor_assignments
            .filter((va) => sharedVendors.includes(va.id))
            .map((va) => va.vendor_profiles?.business_name || 'Unknown Vendor')
            .join(', ');

          conflicts.push(
            `Vendor conflict: ${vendorNames} - insufficient buffer time`
          );
        }
      }
    }
  }

  return conflicts;
}

/**
 * Get display name for event
 */
export function getEventDisplayName(event: WeddingEventData): string {
  if (event.custom_event_name) {
    return event.custom_event_name;
  }

  const nameMap: Record<string, string> = {
    engagement: 'Engagement',
    mehendi: 'Mehendi',
    haldi: 'Haldi',
    sangeet: 'Sangeet',
    wedding: 'Wedding',
    reception: 'Reception',
  };

  return nameMap[event.event_name] || event.event_name;
}

/**
 * Get status color classes
 */
export function getStatusColor(status: EventStatus): string {
  switch (status) {
    case 'ready':
      return 'bg-green-500';
    case 'attention':
      return 'bg-amber-500';
    case 'conflict':
      return 'bg-red-500';
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status: EventStatus): string {
  switch (status) {
    case 'ready':
      return '✅';
    case 'attention':
      return '⚠️';
    case 'conflict':
      return '🔴';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: EventStatus): string {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'attention':
      return 'Attention Needed';
    case 'conflict':
      return 'Conflict';
  }
}
