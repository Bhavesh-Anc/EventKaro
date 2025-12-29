import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WeddingStatCards } from '@/components/features/wedding-stat-cards';
import { WeddingQuickActions } from '@/components/features/wedding-quick-actions';
import { WeddingUpcomingEvents } from '@/components/features/wedding-upcoming-events';
import { WeddingGuestOverview } from '@/components/features/wedding-guest-overview';
import { WeddingBudgetTracker } from '@/components/features/wedding-budget-tracker';
import { WeddingVendorList } from '@/components/features/wedding-vendor-list';
import { WeddingTaskList } from '@/components/features/wedding-task-list';
import { differenceInDays } from 'date-fns';

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
  const { data: allEvents } = await supabase
    .from('events')
    .select('id')
    .eq('organization_id', currentOrg.id)
    .limit(1);

  // If no events, redirect to event creation
  if (!allEvents || allEvents.length === 0) {
    redirect('/events/new');
  }

  // Fetch wedding events for this organization
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .order('start_date', { ascending: true })
    .limit(1);

  const weddingEvent = weddingEvents?.[0];

  // Calculate days to wedding
  const daysToWedding = weddingEvent
    ? Math.max(0, differenceInDays(new Date(weddingEvent.start_date), new Date()))
    : 0;

  // Fetch guest statistics
  const { data: guests, count: totalGuests } = await supabase
    .from('guests')
    .select('rsvp_status', { count: 'exact' })
    .eq('organization_id', currentOrg.id);

  const confirmedGuests = guests?.filter((g) => g.rsvp_status === 'confirmed').length || 0;
  const pendingGuests = guests?.filter((g) => g.rsvp_status === 'pending').length || 0;
  const declinedGuests = guests?.filter((g) => g.rsvp_status === 'declined').length || 0;

  // Fetch tasks
  const { data: tasks, count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('organization_id', currentOrg.id);

  const tasksCompleted = tasks?.filter((t) => t.completed).length || 0;

  // Calculate budget stats from wedding events if available
  let budgetUsed = 0;
  let totalBudget = 0;
  let totalSpent = 0;
  const budgetCategories: any[] = [];

  if (weddingEvent) {
    const { data: eventBudgets } = await supabase
      .from('wedding_event_budgets')
      .select('*')
      .eq('parent_event_id', weddingEvent.id);

    if (eventBudgets && eventBudgets.length > 0) {
      totalBudget = eventBudgets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
      totalSpent = eventBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
      budgetUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    }
  }

  // Fetch upcoming wedding sub-events
  const upcomingEvents = weddingEvent
    ? await supabase
        .from('wedding_events')
        .select('*')
        .eq('parent_event_id', weddingEvent.id)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(3)
    : { data: [] };

  // Format upcoming events for component
  const formattedEvents =
    upcomingEvents.data?.map((e) => ({
      id: e.id,
      title: e.custom_event_name || e.event_name,
      venue: e.venue_name || 'TBD',
      date: new Date(e.start_datetime),
      time: new Date(e.start_datetime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      expectedGuests: e.expected_guest_count || 0,
      confirmed: 0,
      eventType: e.event_name,
    })) || [];

  // Fetch vendors assigned to this event
  const { data: vendorAssignments } = await supabase
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

      {/* Quick Actions */}
      <WeddingQuickActions eventId={weddingEvent?.id} />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <WeddingUpcomingEvents events={formattedEvents} parentEventId={weddingEvent?.id} />
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
          <WeddingBudgetTracker
            categories={budgetCategories}
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            eventId={weddingEvent?.id}
          />
          <WeddingVendorList vendors={vendors} eventId={weddingEvent?.id} />
          <WeddingTaskList tasks={recentTasks} eventId={weddingEvent?.id} />
        </div>
      </div>
    </div>
  );
}
