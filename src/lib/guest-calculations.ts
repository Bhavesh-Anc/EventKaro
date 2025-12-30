/**
 * Guest Management Calculations
 *
 * Server-side logic for guest metrics, cost calculations, and alerts
 * Critical: This MUST be computed server-side, not frontend math
 */

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
  confirmationRate: number;
}

export interface OutstationStats {
  total: number;
  roomsAssigned: number;
  pickupNeeded: number;
  roomsUnassigned: number;
  pickupUnassigned: number;
}

export interface VIPStats {
  total: number;
  elderly: number;
  children: number;
}

export interface CostImpact {
  catering: number;
  rooms: number;
  transport: number;
  total: number;
  pendingImpact: number;
}

export interface GuestAlert {
  id: string;
  severity: 'red' | 'amber';
  message: string;
  link: string;
  impact?: string;
}

/**
 * Calculate confirmation rate with color coding
 */
export function calculateConfirmationRate(confirmed: number, total: number): {
  rate: number;
  color: 'green' | 'amber' | 'red';
} {
  if (total === 0) return { rate: 0, color: 'amber' };

  const rate = Math.round((confirmed / total) * 100);

  let color: 'green' | 'amber' | 'red';
  if (rate >= 85) color = 'green';
  else if (rate >= 60) color = 'amber';
  else color = 'red';

  return { rate, color };
}

/**
 * Calculate cost per guest category
 */
export function calculateGuestCosts(
  guestCount: number,
  options: {
    cateringPerHead?: number;
    roomsNeeded?: number;
    roomCostPerNight?: number;
    transportSeats?: number;
    transportCostPerSeat?: number;
  } = {}
): CostImpact {
  const {
    cateringPerHead = 1500, // Default ₹1500 per head
    roomsNeeded = 0,
    roomCostPerNight = 4000, // Default ₹4000 per room
    transportSeats = 0,
    transportCostPerSeat = 500, // Default ₹500 per seat
  } = options;

  const catering = guestCount * cateringPerHead;
  const rooms = roomsNeeded * roomCostPerNight;
  const transport = transportSeats * transportCostPerSeat;
  const total = catering + rooms + transport;

  return {
    catering,
    rooms,
    transport,
    total,
    pendingImpact: 0, // Calculated separately
  };
}

/**
 * Generate smart alerts based on guest data
 */
export function generateGuestAlerts(
  stats: GuestStats,
  outstation: OutstationStats,
  vip: VIPStats,
  rsvpCutoffPassed: boolean,
  options: {
    cateringPerHead?: number;
  } = {}
): GuestAlert[] {
  const alerts: GuestAlert[] = [];
  const { cateringPerHead = 1500 } = options;

  // Alert 1: Late confirmations after RSVP cutoff
  if (rsvpCutoffPassed && stats.confirmed > 0) {
    const lateConfirmations = stats.confirmed; // This should be filtered by date in actual implementation
    if (lateConfirmations > 0) {
      const cost = lateConfirmations * cateringPerHead;
      alerts.push({
        id: 'late-confirmations',
        severity: 'red',
        message: `${lateConfirmations} guests confirmed after RSVP cutoff`,
        link: '/guests?filter=late-confirmations',
        impact: `+₹${cost.toLocaleString('en-IN')}`,
      });
    }
  }

  // Alert 2: Outstation guests without hotel
  if (outstation.roomsUnassigned > 0) {
    alerts.push({
      id: 'no-hotel',
      severity: 'amber',
      message: `${outstation.roomsUnassigned} outstation guests have no hotel assigned`,
      link: '/guests?view=logistics&filter=no-hotel',
    });
  }

  // Alert 3: Pickup not assigned
  if (outstation.pickupUnassigned > 0) {
    alerts.push({
      id: 'no-pickup',
      severity: 'amber',
      message: `${outstation.pickupUnassigned} guests need pickup assignment`,
      link: '/guests?view=logistics&filter=no-pickup',
    });
  }

  // Alert 4: Elderly guests in late-night events (would need event data)
  // This is a placeholder - actual implementation would check event timings

  // Sort by severity and limit to top 3
  return alerts
    .sort((a, b) => (a.severity === 'red' ? -1 : 1))
    .slice(0, 3);
}

/**
 * Calculate household completeness
 * Returns percentage of families with complete RSVP responses
 */
export function calculateHouseholdCompleteness(
  totalFamilies: number,
  fullyResponded: number,
  partialResponses: number
): {
  percentage: number;
  fullyResponded: number;
  partialResponses: number;
  pending: number;
} {
  const pending = totalFamilies - fullyResponded - partialResponses;
  const percentage = totalFamilies > 0
    ? Math.round((fullyResponded / totalFamilies) * 100)
    : 0;

  return {
    percentage,
    fullyResponded,
    partialResponses,
    pending,
  };
}
