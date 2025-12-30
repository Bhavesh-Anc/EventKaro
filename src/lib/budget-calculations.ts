/**
 * BUDGET CALCULATIONS
 *
 * Server-side budget computations for EventKaro
 * Handles planned vs committed vs paid tracking with risk awareness
 */

export interface BudgetSummary {
  totalBudget: number;
  planned: number;
  committed: number;
  paid: number;
  pending: number;
  overrun: number;
  health: 'on-track' | 'at-risk' | 'over-budget';
}

export interface CategoryBudget {
  category: string;
  planned: number;
  committed: number;
  paid: number;
  pending: number;
  delta: number;
  deltaPercentage: number;
  isOverBudget: boolean;
}

export interface BudgetAlert {
  id: string;
  severity: 'red' | 'amber';
  message: string;
  link: string;
  impact?: string;
}

export interface CostDriver {
  name: string;
  planned: number;
  current: number;
  delta: number;
}

/**
 * Calculate budget health status
 */
export function calculateBudgetHealth(
  totalBudget: number,
  committed: number,
  pending: number
): 'on-track' | 'at-risk' | 'over-budget' {
  if (committed > totalBudget) {
    return 'over-budget';
  }

  const utilizationRate = committed / totalBudget;
  const remainingBuffer = totalBudget - committed;

  // At risk if pending + potential risks exceed buffer or utilization > 90%
  if (pending > remainingBuffer * 0.5 || utilizationRate > 0.9) {
    return 'at-risk';
  }

  return 'on-track';
}

/**
 * Aggregate budget summary from categories
 */
export function aggregateBudgetSummary(
  categories: CategoryBudget[],
  totalBudget: number
): BudgetSummary {
  const planned = categories.reduce((sum, cat) => sum + cat.planned, 0);
  const committed = categories.reduce((sum, cat) => sum + cat.committed, 0);
  const paid = categories.reduce((sum, cat) => sum + cat.paid, 0);
  const pending = committed - paid;
  const overrun = Math.max(0, committed - totalBudget);

  return {
    totalBudget,
    planned,
    committed,
    paid,
    pending,
    overrun,
    health: calculateBudgetHealth(totalBudget, committed, pending),
  };
}

/**
 * Calculate top cost drivers
 */
export function calculateTopCostDrivers(
  categories: CategoryBudget[],
  limit: number = 4
): CostDriver[] {
  return categories
    .map((cat) => ({
      name: cat.category,
      planned: cat.planned,
      current: cat.committed,
      delta: cat.delta,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, limit);
}

/**
 * Generate budget alerts
 */
export function generateBudgetAlerts(
  summary: BudgetSummary,
  categories: CategoryBudget[],
  lateRSVPCount: number,
  lateRSVPCost: number,
  unpaidVendorsCount: number,
  unpaidAmount: number,
  daysToEvent: number
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  // Alert: Late RSVPs increasing cost
  if (lateRSVPCount > 0 && lateRSVPCost > 0) {
    alerts.push({
      id: 'late-rsvp-cost',
      severity: 'red',
      message: `${lateRSVPCount} late RSVPs increased catering cost by ₹${(lateRSVPCost / 100).toLocaleString('en-IN')}`,
      link: '/guests?filter=late',
      impact: `+₹${(lateRSVPCost / 100).toLocaleString('en-IN')}`,
    });
  }

  // Alert: Overbudget categories
  const overbudgetCategories = categories.filter((cat) => cat.isOverBudget);
  if (overbudgetCategories.length > 0) {
    const worstCategory = overbudgetCategories.sort((a, b) => b.delta - a.delta)[0];
    alerts.push({
      id: 'category-overbudget',
      severity: 'amber',
      message: `${capitalizeFirst(worstCategory.category)} exceeds budget by ₹${(worstCategory.delta / 100).toLocaleString('en-IN')}`,
      link: '/budget',
      impact: `+₹${(worstCategory.delta / 100).toLocaleString('en-IN')}`,
    });
  }

  // Alert: Unpaid vendors near event date
  if (unpaidVendorsCount > 0 && daysToEvent <= 7) {
    alerts.push({
      id: 'unpaid-vendors',
      severity: 'red',
      message: `${unpaidVendorsCount} vendors unpaid within ${daysToEvent} days of event`,
      link: '/budget?view=pending-payments',
      impact: `₹${(unpaidAmount / 100).toLocaleString('en-IN')} pending`,
    });
  }

  // Alert: Overall overbudget
  if (summary.health === 'over-budget') {
    alerts.push({
      id: 'overall-overbudget',
      severity: 'red',
      message: `Total committed exceeds budget by ₹${(summary.overrun / 100).toLocaleString('en-IN')}`,
      link: '/budget',
      impact: `+₹${(summary.overrun / 100).toLocaleString('en-IN')}`,
    });
  }

  // Sort by severity (red first) and limit to 3
  return alerts
    .sort((a, b) => (a.severity === 'red' ? -1 : 1))
    .slice(0, 3);
}

/**
 * Calculate guest-driven cost impact
 */
export function calculateGuestCostPerUnit(
  cateringBudget: number,
  accommodationBudget: number,
  transportBudget: number,
  totalGuests: number
): number {
  if (totalGuests === 0) return 0;

  const totalGuestDrivenCost = cateringBudget + accommodationBudget + transportBudget;
  return Math.round((totalGuestDrivenCost / totalGuests) * 10); // Per 10 guests
}

/**
 * Format currency in INR
 */
export function formatINR(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  if (rupees >= 10000000) {
    // 1 crore+
    return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  } else if (rupees >= 100000) {
    // 1 lakh+
    return `₹${(rupees / 100000).toFixed(2)}L`;
  } else if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Format full currency in INR
 */
export function formatFullINR(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

/**
 * Calculate change impact for preview
 */
export function calculateChangeImpact(
  changeType: 'add-guests' | 'add-vendor' | 'change-scope',
  changeValue: number,
  affectedCategories: string[],
  costPerGuest?: number
): {
  totalImpact: number;
  affectedCategoriesCount: number;
  message: string;
} {
  let totalImpact = 0;

  switch (changeType) {
    case 'add-guests':
      totalImpact = changeValue * (costPerGuest || 2840); // ₹28.40 per guest default
      break;
    case 'add-vendor':
      totalImpact = changeValue;
      break;
    case 'change-scope':
      totalImpact = changeValue;
      break;
  }

  return {
    totalImpact: totalImpact * 100, // Convert to paise
    affectedCategoriesCount: affectedCategories.length,
    message: `This change will increase total budget by ₹${totalImpact.toLocaleString('en-IN')} and affect ${affectedCategories.length} ${affectedCategories.length === 1 ? 'category' : 'categories'}.`,
  };
}
