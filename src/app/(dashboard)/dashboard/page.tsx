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

  // Fetch wedding events for this organization
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .eq('status', 'published')
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

  // Placeholder stats (TODO: Implement real queries)
  const budgetUsed = 65; // percentage
  const tasksCompleted = 42;
  const totalTasks = 68;

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
      confirmed: 0, // TODO: Implement real count
      eventType: e.event_name,
    })) || [];

  // Placeholder data for widgets
  const budgetCategories = [
    { name: 'Venue', spent: 500000, budget: 800000, color: 'from-purple-500 to-purple-600' },
    { name: 'Catering', spent: 300000, budget: 500000, color: 'from-blue-500 to-blue-600' },
    { name: 'Photography', spent: 150000, budget: 200000, color: 'from-green-500 to-green-600' },
    { name: 'Decoration', spent: 100000, budget: 150000, color: 'from-pink-500 to-pink-600' },
  ];

  const vendors = [
    {
      id: '1',
      name: 'Royal Caterers',
      category: 'Catering',
      status: 'confirmed' as const,
      phone: '+91 98765 43210',
      email: 'royal@caterers.com',
    },
    {
      id: '2',
      name: 'Pixel Perfect Studio',
      category: 'Photography',
      status: 'pending' as const,
      phone: '+91 98765 43211',
      email: 'hello@pixelperfect.com',
    },
  ];

  const tasks = [
    {
      id: '1',
      title: 'Finalize menu with caterer',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'high' as const,
      completed: false,
      assignee: 'You',
    },
    {
      id: '2',
      title: 'Book makeup artist',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Send invitations',
      priority: 'high' as const,
      completed: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your wedding</p>
      </div>

      {/* Stats Cards */}
      <WeddingStatCards
        stats={{
          daysToWedding,
          totalGuests: totalGuests || 0,
          budgetUsed,
          tasksCompleted,
          totalTasks,
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
            totalBudget={1650000}
            totalSpent={1050000}
            eventId={weddingEvent?.id}
          />
          <WeddingVendorList vendors={vendors} eventId={weddingEvent?.id} />
          <WeddingTaskList tasks={tasks} eventId={weddingEvent?.id} />
        </div>
      </div>
    </div>
  );
}
