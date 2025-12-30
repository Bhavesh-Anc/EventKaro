'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * BUDGET SERVER ACTIONS
 *
 * Mutations for wedding budget management:
 * - Creating, updating, deleting budget entries
 * - Recording vendor payments
 * - Updating total budget settings
 */

// ============================================================================
// BUDGET ENTRY CRUD
// ============================================================================

/**
 * Create a new budget entry for a wedding event
 */
export async function createBudgetEntry(params: {
  weddingEventId: string;
  category: string;
  vendorId?: string;
  plannedAmountInr: number;
  committedAmountInr?: number;
  paidAmountInr?: number;
  description?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .insert({
      wedding_event_id: params.weddingEventId,
      category: params.category,
      vendor_id: params.vendorId || null,
      planned_amount_inr: params.plannedAmountInr,
      committed_amount_inr: params.committedAmountInr || 0,
      paid_amount_inr: params.paidAmountInr || 0,
      description: params.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating budget entry:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true, data };
}

/**
 * Update an existing budget entry
 */
export async function updateBudgetEntry(params: {
  budgetEntryId: string;
  plannedAmountInr?: number;
  committedAmountInr?: number;
  paidAmountInr?: number;
  description?: string;
}) {
  const supabase = await createClient();

  const updateData: any = {};
  if (params.plannedAmountInr !== undefined) updateData.planned_amount_inr = params.plannedAmountInr;
  if (params.committedAmountInr !== undefined) updateData.committed_amount_inr = params.committedAmountInr;
  if (params.paidAmountInr !== undefined) updateData.paid_amount_inr = params.paidAmountInr;
  if (params.description !== undefined) updateData.description = params.description;

  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .update(updateData)
    .eq('id', params.budgetEntryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget entry:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true, data };
}

/**
 * Delete a budget entry
 */
export async function deleteBudgetEntry(budgetEntryId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wedding_event_budgets')
    .delete()
    .eq('id', budgetEntryId);

  if (error) {
    console.error('Error deleting budget entry:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============================================================================
// VENDOR PAYMENT OPERATIONS
// ============================================================================

/**
 * Record a vendor payment
 * Updates the paid_amount_inr for a budget entry
 */
export async function recordVendorPayment(params: {
  budgetEntryId: string;
  paymentAmountInr: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  // First, get current paid amount
  const { data: currentEntry } = await supabase
    .from('wedding_event_budgets')
    .select('paid_amount_inr')
    .eq('id', params.budgetEntryId)
    .single();

  if (!currentEntry) {
    return { success: false, error: 'Budget entry not found' };
  }

  const newPaidAmount = (currentEntry.paid_amount_inr || 0) + params.paymentAmountInr;

  // Update the paid amount
  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .update({
      paid_amount_inr: newPaidAmount,
    })
    .eq('id', params.budgetEntryId)
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }

  // TODO: Create payment record in payments table if it exists
  // This would store payment_date, payment_method, notes, etc.

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true, data };
}

/**
 * Mark vendor as fully paid
 * Sets paid_amount_inr = committed_amount_inr
 */
export async function markVendorAsPaid(budgetEntryId: string) {
  const supabase = await createClient();

  // Get current committed amount
  const { data: currentEntry } = await supabase
    .from('wedding_event_budgets')
    .select('committed_amount_inr')
    .eq('id', budgetEntryId)
    .single();

  if (!currentEntry) {
    return { success: false, error: 'Budget entry not found' };
  }

  // Set paid = committed
  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .update({
      paid_amount_inr: currentEntry.committed_amount_inr,
    })
    .eq('id', budgetEntryId)
    .select()
    .single();

  if (error) {
    console.error('Error marking vendor as paid:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true, data };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Update multiple budget entries at once
 * Useful for bulk edits or scope changes
 */
export async function updateMultipleBudgetEntries(updates: Array<{
  budgetEntryId: string;
  plannedAmountInr?: number;
  committedAmountInr?: number;
  paidAmountInr?: number;
}>) {
  const supabase = await createClient();
  const results = [];

  for (const update of updates) {
    const updateData: any = {};
    if (update.plannedAmountInr !== undefined) updateData.planned_amount_inr = update.plannedAmountInr;
    if (update.committedAmountInr !== undefined) updateData.committed_amount_inr = update.committedAmountInr;
    if (update.paidAmountInr !== undefined) updateData.paid_amount_inr = update.paidAmountInr;

    const { data, error } = await supabase
      .from('wedding_event_budgets')
      .update(updateData)
      .eq('id', update.budgetEntryId)
      .select()
      .single();

    results.push({ budgetEntryId: update.budgetEntryId, success: !error, data, error });
  }

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return { success: true, results };
}

// ============================================================================
// BUDGET QUERY HELPERS
// ============================================================================

/**
 * Get all budget entries for a wedding event
 */
export async function getBudgetEntriesForEvent(parentEventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .select(`
      *,
      wedding_events!inner(id, parent_event_id, event_name, custom_event_name),
      vendors:vendor_profiles(id, business_name, category)
    `)
    .eq('wedding_events.parent_event_id', parentEventId)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching budget entries:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

/**
 * Get budget entries for a specific vendor
 */
export async function getBudgetEntriesForVendor(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .select(`
      *,
      wedding_events(id, event_name, custom_event_name)
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor budget entries:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

/**
 * Get pending payments (budget entries with pending_amount_inr > 0)
 */
export async function getPendingPayments(parentEventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('wedding_event_budgets')
    .select(`
      *,
      wedding_events!inner(id, parent_event_id, event_name, custom_event_name),
      vendors:vendor_profiles(id, business_name, category, contact_phone)
    `)
    .eq('wedding_events.parent_event_id', parentEventId)
    .gt('pending_amount_inr', 0)
    .order('pending_amount_inr', { ascending: false });

  if (error) {
    console.error('Error fetching pending payments:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

// ============================================================================
// SCOPE CHANGE TRACKING
// ============================================================================

/**
 * Log a budget scope change
 * Records when and why budget allocations changed
 */
export async function logBudgetScopeChange(params: {
  parentEventId: string;
  changeType: 'guest_increase' | 'vendor_change' | 'scope_expansion' | 'price_increase' | 'other';
  affectedCategories: string[];
  oldBudgetInr: number;
  newBudgetInr: number;
  reason: string;
  notes?: string;
}) {
  const supabase = await createClient();

  // TODO: Create scope_changes table to track this
  // For now, we'll just return success
  // In production, you'd insert into a scope_changes table:
  /*
  const { data, error } = await supabase
    .from('budget_scope_changes')
    .insert({
      parent_event_id: params.parentEventId,
      change_type: params.changeType,
      affected_categories: params.affectedCategories,
      old_budget_inr: params.oldBudgetInr,
      new_budget_inr: params.newBudgetInr,
      reason: params.reason,
      notes: params.notes,
      changed_at: new Date().toISOString(),
    })
    .select()
    .single();
  */

  revalidatePath('/budget');
  revalidatePath('/dashboard');
  return {
    success: true,
    message: 'Scope change logged (table creation pending)',
    data: params
  };
}

/**
 * Calculate change impact preview
 * Shows what would happen if guest count or vendor prices change
 */
export async function calculateChangeImpact(params: {
  parentEventId: string;
  changeType: 'add_guests' | 'add_vendor' | 'change_scope';
  guestCountChange?: number;
  vendorPriceChanges?: Array<{ budgetEntryId: string; newCommittedAmountInr: number }>;
}) {
  const supabase = await createClient();

  // Get current budget state
  const { data: currentBudgets } = await supabase
    .from('wedding_event_budgets')
    .select(`
      *,
      wedding_events!inner(id, parent_event_id)
    `)
    .eq('wedding_events.parent_event_id', params.parentEventId);

  if (!currentBudgets) {
    return { success: false, error: 'Could not fetch current budget' };
  }

  let impactDescription = '';
  let affectedCategories: string[] = [];
  let totalImpactInr = 0;

  if (params.changeType === 'add_guests' && params.guestCountChange) {
    // Calculate per-guest cost from catering/transport/accommodation
    const guestDrivenCategories = ['catering', 'transportation', 'accommodation'];
    const guestDrivenBudgets = currentBudgets.filter(b =>
      guestDrivenCategories.includes(b.category)
    );

    affectedCategories = [...new Set(guestDrivenBudgets.map(b => b.category))];

    // Estimate impact (rough estimate: ₹2840 per guest for catering+transport+accommodation)
    totalImpactInr = params.guestCountChange * 284000; // ₹2840 * 100 (in paise)

    impactDescription = `Adding ${params.guestCountChange} guests will increase budget by approximately ₹${(totalImpactInr / 100).toLocaleString('en-IN')}. Affected categories: ${affectedCategories.join(', ')}.`;
  }

  if (params.changeType === 'add_vendor' && params.vendorPriceChanges) {
    for (const change of params.vendorPriceChanges) {
      const currentBudget = currentBudgets.find(b => b.id === change.budgetEntryId);
      if (currentBudget) {
        const delta = change.newCommittedAmountInr - (currentBudget.committed_amount_inr || 0);
        totalImpactInr += delta;
        if (!affectedCategories.includes(currentBudget.category)) {
          affectedCategories.push(currentBudget.category);
        }
      }
    }

    impactDescription = `Vendor changes will impact budget by ₹${(totalImpactInr / 100).toLocaleString('en-IN')}. Affected categories: ${affectedCategories.join(', ')}.`;
  }

  return {
    success: true,
    impact: {
      totalImpactInr,
      affectedCategories,
      description: impactDescription,
      changeType: params.changeType,
    },
  };
}
