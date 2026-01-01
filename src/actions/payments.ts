'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// PAYMENT INSTALLMENT MANAGEMENT
// ============================================================================

/**
 * Get all payment installments for an event
 */
export async function getEventPaymentInstallments(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_payment_installments')
    .select(`
      *,
      vendor:vendors(id, business_name, business_type)
    `)
    .eq('event_id', eventId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching payment installments:', error);
    return [];
  }

  // Group by vendor
  const vendorPayments: Record<string, any> = {};
  data.forEach(installment => {
    const vendorId = installment.vendor_id || 'unknown';
    if (!vendorPayments[vendorId]) {
      vendorPayments[vendorId] = {
        vendor_id: vendorId,
        vendor_name: installment.vendor?.business_name || 'Unknown Vendor',
        vendor_type: installment.vendor?.business_type || 'Other',
        contract_value: 0,
        installments: [],
      };
    }
    vendorPayments[vendorId].installments.push(installment);
    vendorPayments[vendorId].contract_value += installment.amount_inr;
  });

  return Object.values(vendorPayments);
}

/**
 * Create payment installments for a vendor booking
 */
export async function createPaymentInstallments(
  eventId: string,
  vendorId: string,
  vendorBookingId: string | null,
  totalAmount: number,
  installmentPlan: {
    name: string;
    percentage: number;
    dueDate: string;
  }[]
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const installments = installmentPlan.map((plan, index) => ({
    event_id: eventId,
    vendor_id: vendorId,
    vendor_booking_id: vendorBookingId,
    installment_number: index + 1,
    installment_name: plan.name,
    amount_inr: Math.round((totalAmount * plan.percentage) / 100),
    percentage: plan.percentage,
    due_date: plan.dueDate,
    status: 'pending',
    created_by: user.id,
  }));

  const { error } = await supabase
    .from('vendor_payment_installments')
    .insert(installments);

  if (error) {
    console.error('Error creating payment installments:', error);
    return { error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/vendors');
  return { success: true };
}

/**
 * Mark an installment as paid
 */
export async function markInstallmentPaid(
  installmentId: string,
  paymentDetails: {
    amount: number;
    method: string;
    reference?: string;
    date: string;
  }
) {
  const supabase = await createClient();

  // Get current installment
  const { data: installment } = await supabase
    .from('vendor_payment_installments')
    .select('amount_inr, paid_amount_inr')
    .eq('id', installmentId)
    .single();

  if (!installment) {
    return { error: 'Installment not found' };
  }

  const newPaidAmount = (installment.paid_amount_inr || 0) + paymentDetails.amount;
  const isFullyPaid = newPaidAmount >= installment.amount_inr;

  const { error } = await supabase
    .from('vendor_payment_installments')
    .update({
      status: isFullyPaid ? 'paid' : 'partially_paid',
      paid_amount_inr: newPaidAmount,
      paid_date: paymentDetails.date,
      payment_method: paymentDetails.method,
      payment_reference: paymentDetails.reference,
    })
    .eq('id', installmentId);

  if (error) {
    console.error('Error marking installment paid:', error);
    return { error: error.message };
  }

  revalidatePath('/budget');
  revalidatePath('/vendors');
  return { success: true };
}

/**
 * Update installment status (check for overdue)
 */
export async function updateOverdueInstallments(eventId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('vendor_payment_installments')
    .update({ status: 'overdue' })
    .eq('event_id', eventId)
    .eq('status', 'pending')
    .lt('due_date', today);

  if (error) {
    console.error('Error updating overdue installments:', error);
    return { error: error.message };
  }

  // Also update 'due' status for today
  await supabase
    .from('vendor_payment_installments')
    .update({ status: 'due' })
    .eq('event_id', eventId)
    .eq('status', 'pending')
    .eq('due_date', today);

  return { success: true };
}

/**
 * Get payment summary for dashboard
 */
export async function getPaymentSummary(eventId: string) {
  const supabase = await createClient();

  const { data: installments } = await supabase
    .from('vendor_payment_installments')
    .select('amount_inr, paid_amount_inr, status, due_date')
    .eq('event_id', eventId);

  if (!installments) {
    return {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      overdueCount: 0,
      upcomingCount: 0,
      nextDueDate: null,
      nextDueAmount: 0,
    };
  }

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  let total = 0;
  let paid = 0;
  let overdue = 0;
  let overdueCount = 0;
  let upcomingCount = 0;
  let nextDueDate: string | null = null;
  let nextDueAmount = 0;

  installments.forEach(inst => {
    total += inst.amount_inr;
    paid += inst.paid_amount_inr || 0;

    if (inst.status === 'overdue') {
      overdue += inst.amount_inr - (inst.paid_amount_inr || 0);
      overdueCount++;
    }

    if (inst.status !== 'paid' && inst.status !== 'cancelled') {
      const dueDate = new Date(inst.due_date);
      if (dueDate >= today && dueDate <= nextWeek) {
        upcomingCount++;
      }

      if (!nextDueDate || dueDate < new Date(nextDueDate)) {
        nextDueDate = inst.due_date;
        nextDueAmount = inst.amount_inr - (inst.paid_amount_inr || 0);
      }
    }
  });

  return {
    total,
    paid,
    pending: total - paid,
    overdue,
    overdueCount,
    upcomingCount,
    nextDueDate,
    nextDueAmount,
  };
}

// ============================================================================
// BUDGET CONTRIBUTIONS
// ============================================================================

/**
 * Add a budget contribution from family
 */
export async function addBudgetContribution(
  eventId: string,
  contribution: {
    contributorName: string;
    contributorSide: 'bride' | 'groom' | 'other';
    contributorRelation?: string;
    amount: number;
    contributionType?: 'monetary' | 'in_kind' | 'service';
    category?: string;
    status?: 'pledged' | 'received' | 'pending';
    notes?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('budget_contributions')
    .insert({
      event_id: eventId,
      contributor_name: contribution.contributorName,
      contributor_side: contribution.contributorSide,
      contributor_relation: contribution.contributorRelation,
      amount_inr: contribution.amount,
      contribution_type: contribution.contributionType || 'monetary',
      category: contribution.category,
      status: contribution.status || 'pledged',
      notes: contribution.notes,
    });

  if (error) {
    console.error('Error adding budget contribution:', error);
    return { error: error.message };
  }

  revalidatePath('/budget');
  return { success: true };
}

/**
 * Get all budget contributions for an event
 */
export async function getEventContributions(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('budget_contributions')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contributions:', error);
    return [];
  }

  return data;
}

/**
 * Get contribution summary by side
 */
export async function getContributionSummary(eventId: string) {
  const supabase = await createClient();

  const { data: contributions } = await supabase
    .from('budget_contributions')
    .select('contributor_side, amount_inr, status')
    .eq('event_id', eventId);

  if (!contributions) {
    return {
      bride: { pledged: 0, received: 0, pending: 0 },
      groom: { pledged: 0, received: 0, pending: 0 },
      other: { pledged: 0, received: 0, pending: 0 },
      total: { pledged: 0, received: 0, pending: 0 },
    };
  }

  const summary: Record<string, { pledged: number; received: number; pending: number }> = {
    bride: { pledged: 0, received: 0, pending: 0 },
    groom: { pledged: 0, received: 0, pending: 0 },
    other: { pledged: 0, received: 0, pending: 0 },
    total: { pledged: 0, received: 0, pending: 0 },
  };

  contributions.forEach(c => {
    const side = c.contributor_side || 'other';
    if (c.status === 'received') {
      summary[side].received += c.amount_inr;
      summary.total.received += c.amount_inr;
    } else if (c.status === 'pending') {
      summary[side].pending += c.amount_inr;
      summary.total.pending += c.amount_inr;
    }
    summary[side].pledged += c.amount_inr;
    summary.total.pledged += c.amount_inr;
  });

  return summary;
}

/**
 * Mark contribution as received
 */
export async function markContributionReceived(
  contributionId: string,
  receivedDate?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('budget_contributions')
    .update({
      status: 'received',
      received_date: receivedDate || new Date().toISOString().split('T')[0],
    })
    .eq('id', contributionId);

  if (error) {
    console.error('Error marking contribution received:', error);
    return { error: error.message };
  }

  revalidatePath('/budget');
  return { success: true };
}
