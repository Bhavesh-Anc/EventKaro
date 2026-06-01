import { getEvent } from '@/actions/events';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logQueryError } from '@/lib/query-helpers';
import { differenceInDays } from 'date-fns';

function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default async function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const supabase = await createClient();

  // Guests for this event
  const { data: guests, error: guestErr } = await supabase
    .from('guests')
    .select('rsvp_status, is_outstation, family_side')
    .eq('event_id', eventId);
  logQueryError('analytics guests', guestErr);

  const totalGuests = guests?.length || 0;
  const confirmed = guests?.filter((g) => g.rsvp_status === 'accepted').length || 0;
  const pending = guests?.filter((g) => g.rsvp_status === 'pending').length || 0;
  const declined = guests?.filter((g) => g.rsvp_status === 'declined').length || 0;
  const outstation = guests?.filter((g) => g.is_outstation).length || 0;
  const brideSide = guests?.filter((g) => g.family_side === 'bride').length || 0;
  const groomSide = guests?.filter((g) => g.family_side === 'groom').length || 0;
  const responseRate = totalGuests > 0 ? Math.round(((confirmed + declined) / totalGuests) * 100) : 0;

  // Tasks for this event
  const { data: tasks, error: taskErr } = await supabase
    .from('tasks')
    .select('completed, priority')
    .eq('event_id', eventId);
  logQueryError('analytics tasks', taskErr);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const highPriorityPending = tasks?.filter((t) => !t.completed && t.priority === 'high').length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Budget for this wedding
  const { data: budgetEntries, error: budgetErr } = await supabase
    .from('wedding_event_budgets')
    .select('planned_amount_inr, committed_amount_inr, paid_amount_inr, pending_amount_inr, category, wedding_events!inner(parent_event_id)')
    .eq('wedding_events.parent_event_id', eventId);
  logQueryError('analytics budget', budgetErr);

  const budget = (budgetEntries || []).reduce(
    (acc, e: any) => ({
      planned: acc.planned + (e.planned_amount_inr || 0),
      committed: acc.committed + (e.committed_amount_inr || 0),
      paid: acc.paid + (e.paid_amount_inr || 0),
      pending: acc.pending + (e.pending_amount_inr || 0),
    }),
    { planned: 0, committed: 0, paid: 0, pending: 0 }
  );

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  (budgetEntries || []).forEach((e: any) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.committed_amount_inr || 0);
  });
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Vendors
  const { data: vendorAssignments } = await supabase
    .from('wedding_event_vendor_assignments')
    .select('status')
    .eq('parent_event_id', eventId);

  const vendorStats = {
    total: vendorAssignments?.length || 0,
    confirmed: vendorAssignments?.filter((v) => v.status === 'confirmed').length || 0,
    pending: vendorAssignments?.filter((v) => v.status === 'pending' || v.status === 'contacted').length || 0,
  };

  // Wedding sub-events
  const { data: subEvents } = await supabase
    .from('wedding_events')
    .select('id, status')
    .eq('parent_event_id', eventId);

  const subEventStats = {
    total: subEvents?.length || 0,
    ready: subEvents?.filter((e) => e.status === 'completed' || e.status === 'ready').length || 0,
  };

  // Days to event
  const daysToEvent = event.start_date
    ? Math.max(0, differenceInDays(new Date(event.start_date), new Date()))
    : null;

  const stats = [
    { label: 'Total Guests', value: totalGuests, sub: `${responseRate}% responded`, color: 'bg-blue-500' },
    { label: 'Confirmed', value: confirmed, sub: `${pending} pending`, color: 'bg-green-500' },
    { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, sub: `${highPriorityPending} high priority left`, color: 'bg-purple-500' },
    { label: 'Budget Paid', value: formatINR(budget.paid), sub: `${formatINR(budget.pending)} pending`, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/events/${eventId}`}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to Event
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">{event.title}</p>
        </div>
        {daysToEvent !== null && (
          <div className="text-right">
            <div className="text-4xl font-bold text-rose-700">{daysToEvent}</div>
            <div className="text-sm text-gray-500">days to go</div>
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Planning Progress</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">RSVP Responses</span>
              <span className="font-medium">{responseRate}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${responseRate}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tasks Complete</span>
              <span className="font-medium">{taskProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${taskProgress}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Budget Utilized</span>
              <span className="font-medium">
                {budget.planned > 0 ? Math.round((budget.paid / budget.planned) * 100) : 0}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${budget.planned > 0 ? Math.min(100, (budget.paid / budget.planned) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* RSVP Breakdown */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Guest Breakdown</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{confirmed}</div>
                <div className="text-xs text-green-600">Confirmed</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{pending}</div>
                <div className="text-xs text-amber-600">Pending</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{declined}</div>
                <div className="text-xs text-red-600">Declined</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bride's Side</span>
                <span className="font-medium">{brideSide}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Groom's Side</span>
                <span className="font-medium">{groomSide}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstation</span>
                <span className="font-medium">{outstation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Local</span>
                <span className="font-medium">{totalGuests - outstation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Budget Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Planned</span>
              <span className="font-semibold text-gray-900">{formatINR(budget.planned)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Committed</span>
              <span className="font-semibold text-gray-900">{formatINR(budget.committed)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Paid</span>
              <span className="font-semibold text-green-700">{formatINR(budget.paid)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-amber-700">{formatINR(budget.pending)}</span>
            </div>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Top Spending Categories</h3>
          {topCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">No budget entries yet</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize">{category.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{formatINR(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${budget.committed > 0 ? (amount / budget.committed) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{vendorStats.total}</div>
              <div className="text-xs text-gray-600">Vendors</div>
              <div className="text-xs text-green-600 mt-1">{vendorStats.confirmed} confirmed</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{subEventStats.total}</div>
              <div className="text-xs text-gray-600">Events</div>
              <div className="text-xs text-green-600 mt-1">{subEventStats.ready} ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
