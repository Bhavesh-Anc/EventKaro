import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetClient } from '@/components/features/budget-client';
import type { CategoryBudget } from '@/lib/budget-calculations';
import { aggregateBudgetSummary } from '@/lib/budget-calculations';

export default async function BudgetPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Get wedding event
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('id, start_date')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .limit(1);

  const eventId = weddingEvents?.[0]?.id;
  const eventDate = weddingEvents?.[0]?.start_date;

  if (!eventId) {
    redirect('/events/new');
  }

  // Fetch all budget entries from wedding_event_budgets
  const { data: budgetEntries } = await supabase
    .from('wedding_event_budgets')
    .select(`
      *,
      wedding_events!inner(id, parent_event_id, event_name, custom_event_name),
      vendors:vendor_profiles(id, business_name, category)
    `)
    .eq('wedding_events.parent_event_id', eventId);

  // Aggregate by category
  const categoryMap = new Map<string, CategoryBudget>();

  (budgetEntries || []).forEach((entry: any) => {
    const category = entry.category;
    const existing = categoryMap.get(category) || {
      category,
      planned: 0,
      committed: 0,
      paid: 0,
      pending: 0,
      delta: 0,
      deltaPercentage: 0,
      isOverBudget: false,
    };

    existing.planned += entry.planned_amount_inr || 0;
    existing.committed += entry.committed_amount_inr || 0;
    existing.paid += entry.paid_amount_inr || 0;
    existing.pending += entry.pending_amount_inr || 0;

    categoryMap.set(category, existing);
  });

  // Calculate deltas
  const categories: CategoryBudget[] = Array.from(categoryMap.values()).map((cat) => {
    const delta = cat.committed - cat.planned;
    const deltaPercentage = cat.planned > 0 ? (delta / cat.planned) * 100 : 0;
    return {
      ...cat,
      delta,
      deltaPercentage,
      isOverBudget: cat.committed > cat.planned,
    };
  });

  // Set total budget (₹42L in paise - would come from settings in production)
  const totalBudget = 4200000 * 100;

  const summary = aggregateBudgetSummary(categories, totalBudget);

  // Calculate days to event
  const daysToEvent = eventDate
    ? Math.max(0, Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <BudgetClient
      summary={summary}
      categories={categories}
      budgetEntries={budgetEntries || []}
      eventId={eventId}
      daysToEvent={daysToEvent}
    />
  );
}
