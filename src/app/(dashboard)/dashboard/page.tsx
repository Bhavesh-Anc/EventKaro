import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WeddingStatCards } from '@/components/features/wedding-stat-cards';
import { WeddingQuickActions } from '@/components/features/wedding-quick-actions';
import { DashboardWeddingTimeline } from '@/components/features/dashboard-wedding-timeline';
import { WeddingGuestOverview } from '@/components/features/wedding-guest-overview';
import { DashboardBudgetSnapshot } from '@/components/features/dashboard-budget-snapshot';
import { WeddingVendorList } from '@/components/features/wedding-vendor-list';
import { WeddingTaskList } from '@/components/features/wedding-task-list';
import { DashboardTrends } from '@/components/features/dashboard-trends';
import { ActivityFeed } from '@/components/features/activity-feed';
import { generateRecentActivities } from '@/lib/activities';
import { differenceInDays, subDays } from 'date-fns';
import type { CategoryBudget } from '@/lib/budget-calculations';
import {
  aggregateBudgetSummary,
  calculateTopCostDrivers,
  generateBudgetAlerts,
  calculateGuestCostPerUnit,
} from '@/lib/budget-calculations';
import { getWeddingSettings } from '@/actions/settings';
import { logQueryError } from '@/lib/query-helpers';

export default async function DashboardPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  // If user has no organization, redirect to create one
  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Check if user has any events
  const { data: allEvents, error: allEvtErr } = await supabase
    .from('events')
    .select('id')
    .eq('organization_id', currentOrg.id)
    .limit(1);
  logQueryError('all events', allEvtErr);

  // If no events, redirect to event creation
  if (!allEvents || allEvents.length === 0) {
    redirect('/events/new');
  }

  // Fetch wedding events for this organization
  const { data: weddingEvents, error: wedEvtErr } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .order('start_date', { ascending: true })
    .limit(1);
  logQueryError('wedding events', wedEvtErr);

  const weddingEvent = weddingEvents?.[0];

  // Calculate days to wedding
  const daysToWedding = weddingEvent
    ? Math.max(0, differenceInDays(new Date(weddingEvent.start_date), new Date()))
    : 0;

  // Fetch guest statistics
  const { data: guests, count: totalGuests, error: guestErr } = await supabase
    .from('guests')
    .select('rsvp_status, rsvp_date', { count: 'exact' })
    .eq('organization_id', currentOrg.id);
  logQueryError('guests', guestErr);

  const confirmedGuests = guests?.filter((g) => g.rsvp_status === 'accepted').length || 0;
  const pendingGuests = guests?.filter((g) => g.rsvp_status === 'pending').length || 0;
  const declinedGuests = guests?.filter((g) => g.rsvp_status === 'declined').length || 0;

  // Fetch tasks
  const { data: tasks, count: totalTasks, error: taskErr } = await supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('organization_id', currentOrg.id);
  logQueryError('tasks', taskErr);

  const tasksCompleted = tasks?.filter((t) => t.completed).length || 0;

  // Fetch budget data for Budget Snapshot widget
  let budgetSummary: any = null;
  let costDrivers: any[] = [];
  let budgetAlerts: any[] = [];
  let guestCostPerUnit = 0;
  let vendorsPaid = 0;
  let vendorsPending = 0;
  let totalPendingAmount = 0;
  let budgetUsed = 0; // Still needed for stat cards

  if (weddingEvent) {
    // Fetch all budget entries from wedding_event_budgets
    const { data: budgetEntries, error: budgetErr } = await supabase
      .from('wedding_event_budgets')
      .select(`
        *,
        wedding_events!inner(id, parent_event_id, event_name, custom_event_name),
        vendors:vendor_profiles(id, business_name, category)
      `)
      .eq('wedding_events.parent_event_id', weddingEvent.id);
    logQueryError('budget entries', budgetErr);

    if (budgetEntries && budgetEntries.length > 0) {
      // Aggregate by category
      const categoryMap = new Map<string, CategoryBudget>();

      budgetEntries.forEach((entry: any) => {
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

      // Total budget from saved wedding settings (stored in rupees, used here as paise)
      const weddingSettings = await getWeddingSettings(weddingEvent.id);
      const totalBudgetInPaise = weddingSettings.total_budget_inr * 100;

      // Calculate budget summary
      budgetSummary = aggregateBudgetSummary(categories, totalBudgetInPaise);

      // Calculate cost drivers (top 4)
      costDrivers = calculateTopCostDrivers(categories, 4);

      // Calculate guest-driven cost
      const cateringBudget = categories.find((c) => c.category === 'catering')?.committed || 0;
      const accommodationBudget = categories.find((c) => c.category === 'accommodation')?.committed || 0;
      const transportBudget = categories.find((c) => c.category === 'transportation')?.committed || 0;
      guestCostPerUnit = calculateGuestCostPerUnit(
        cateringBudget,
        accommodationBudget,
        transportBudget,
        totalGuests || 1
      );

      // Calculate vendor payment stats
      const vendorEntries = budgetEntries.filter((e: any) => e.vendor_id);
      vendorsPaid = vendorEntries.filter((e: any) => e.pending_amount_inr === 0 && e.paid_amount_inr > 0).length;
      vendorsPending = vendorEntries.filter((e: any) => e.pending_amount_inr > 0).length;
      totalPendingAmount = budgetEntries.reduce((sum: number, e: any) => sum + (e.pending_amount_inr || 0), 0);

      // Calculate late RSVP stats (guests confirmed after a certain date)
      const lateRSVPCount = 0; // TODO: Calculate from guest RSVP timestamps
      const lateRSVPCost = 0; // TODO: Calculate additional catering cost

      // Count unpaid vendors near event date
      const unpaidVendorsCount = vendorsPending;
      const unpaidAmount = totalPendingAmount;

      // Generate alerts
      budgetAlerts = generateBudgetAlerts(
        budgetSummary,
        categories,
        lateRSVPCount,
        lateRSVPCost,
        unpaidVendorsCount,
        unpaidAmount,
        daysToWedding
      );

      // Calculate budgetUsed for stat cards
      budgetUsed = totalBudgetInPaise > 0
        ? Math.round((budgetSummary.committed / totalBudgetInPaise) * 100)
        : 0;
    }
  }

  // Fetch all wedding sub-events with vendor assignments for status calculation
  let weddingSubEvents: any[] = [];
  if (weddingEvent) {
    const { data, error: subEvtErr } = await supabase
      .from('wedding_events')
      .select(`
        *,
        vendor_assignments:wedding_event_vendor_assignments(
          id,
          status,
          vendors(
            id,
            business_name,
            category
          )
        ),
        budget:wedding_event_budgets(
          allocated_amount,
          spent_amount
        )
      `)
      .eq('parent_event_id', weddingEvent.id)
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });
    logQueryError('wedding sub-events', subEvtErr);
    weddingSubEvents = data || [];
  }

  // Format events for timeline component
  const timelineEvents = weddingSubEvents?.map((e: any) => ({
    id: e.id,
    event_name: e.event_name,
    custom_event_name: e.custom_event_name,
    start_datetime: e.start_datetime,
    end_datetime: e.end_datetime,
    venue_name: e.venue_name,
    expected_guest_count: e.expected_guest_count,
    guest_subset: e.guest_subset,
    vendor_assignments: e.vendor_assignments,
    budget_allocated: e.budget?.[0]?.allocated_amount || 0,
    has_transport: e.transport_required || false,
    transport_assigned: false, // TODO: Check transport assignments
  })) || [];

  // Fetch vendors assigned to this event
  const { data: vendorAssignments, error: vendorErr } = await supabase
    .from('wedding_event_vendor_assignments')
    .select(`
      id,
      status,
      vendors (
        id,
        business_name,
        category,
        contact_phone,
        contact_email
      )
    `)
    .eq('parent_event_id', weddingEvent?.id)
    .limit(5);
  logQueryError('vendor assignments', vendorErr);

  const vendors = vendorAssignments?.map((va: any) => ({
    id: va.vendors.id,
    name: va.vendors.business_name,
    category: va.vendors.category,
    status: va.status,
    phone: va.vendors.contact_phone,
    email: va.vendors.contact_email,
  })) || [];

  // Fetch recent tasks
  const recentTasks = tasks?.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.due_date ? new Date(t.due_date) : undefined,
    priority: t.priority || 'medium',
    completed: t.completed || false,
    assignee: t.assignee || 'Unassigned',
  })) || [];

  // Calculate weekly trends from real timestamps (this week vs the prior week)
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);

  const inWindow = (value: string | null | undefined, from: Date, to: Date) => {
    if (!value) return false;
    const t = new Date(value).getTime();
    return t >= from.getTime() && t < to.getTime();
  };

  // Confirmed guests / RSVP responses bucketed by rsvp_date
  const thisWeekConfirmed = (guests || []).filter(
    (g) => g.rsvp_status === 'accepted' && inWindow(g.rsvp_date, oneWeekAgo, now)
  ).length;
  const lastWeekConfirmed = (guests || []).filter(
    (g) => g.rsvp_status === 'accepted' && inWindow(g.rsvp_date, twoWeeksAgo, oneWeekAgo)
  ).length;

  const isResponded = (s: string) => s === 'accepted' || s === 'declined';
  const thisWeekResponses = (guests || []).filter(
    (g) => isResponded(g.rsvp_status) && inWindow(g.rsvp_date, oneWeekAgo, now)
  ).length;
  const lastWeekResponses = (guests || []).filter(
    (g) => isResponded(g.rsvp_status) && inWindow(g.rsvp_date, twoWeeksAgo, oneWeekAgo)
  ).length;

  // Completed tasks bucketed by completed_at
  const thisWeekTasks = (tasks || []).filter(
    (t) => t.completed && inWindow(t.completed_at, oneWeekAgo, now)
  ).length;
  const lastWeekTasks = (tasks || []).filter(
    (t) => t.completed && inWindow(t.completed_at, twoWeeksAgo, oneWeekAgo)
  ).length;

  // Weekly trends data (real values; budget lacks per-payment dates so it shows the running total)
  const weeklyStats = {
    guestsConfirmed: {
      current: thisWeekConfirmed,
      previous: lastWeekConfirmed,
      label: 'Guests Confirmed',
    },
    tasksCompleted: {
      current: thisWeekTasks,
      previous: lastWeekTasks,
      label: 'Tasks Completed',
    },
    budgetSpent: {
      current: budgetSummary?.paid || 0,
      previous: 0,
      label: 'Budget Spent',
    },
    rsvpResponses: {
      current: thisWeekResponses,
      previous: lastWeekResponses,
      label: 'RSVP Responses',
    },
  };

  // Generate activity feed data
  const recentActivities = generateRecentActivities({
    recentRSVPs: guests?.slice(0, 5).map((g, i) => ({
      name: `Guest ${i + 1}`,
      status: g.rsvp_status === 'accepted' ? 'accepted' : 'declined',
      timestamp: subDays(new Date(), i),
    })) || [],
    recentPayments: [],
    recentTasks: tasks?.filter(t => t.completed).slice(0, 3).map((t, i) => ({
      title: t.title,
      timestamp: subDays(new Date(), i),
    })) || [],
    recentGuests: [],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {weddingEvent ? "Here's what's happening with your wedding" : "Let's get started with your event planning"}
        </p>
      </div>

      {/* Stats Cards */}
      <WeddingStatCards
        stats={{
          daysToWedding,
          totalGuests: totalGuests || 0,
          budgetUsed,
          tasksCompleted,
          totalTasks: totalTasks || 0,
        }}
      />

      {/* Weekly Trends */}
      <DashboardTrends stats={weeklyStats} />

      {/* Quick Actions */}
      <WeddingQuickActions eventId={weddingEvent?.id} />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <DashboardWeddingTimeline events={timelineEvents} parentEventId={weddingEvent?.id || ''} />
          <WeddingGuestOverview
            stats={{
              total: totalGuests || 0,
              confirmed: confirmedGuests,
              pending: pendingGuests,
              declined: declinedGuests,
            }}
            eventId={weddingEvent?.id}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {budgetSummary && (
            <DashboardBudgetSnapshot
              summary={budgetSummary}
              costDrivers={costDrivers}
              alerts={budgetAlerts}
              guestCostPerUnit={guestCostPerUnit}
              vendorsPaid={vendorsPaid}
              vendorsPending={vendorsPending}
              totalPendingAmount={totalPendingAmount}
              eventId={weddingEvent?.id}
            />
          )}
          <WeddingVendorList vendors={vendors} eventId={weddingEvent?.id} />
          <WeddingTaskList tasks={recentTasks} eventId={weddingEvent?.id} />
          <ActivityFeed activities={recentActivities} maxItems={8} />
        </div>
      </div>
    </div>
  );
}
