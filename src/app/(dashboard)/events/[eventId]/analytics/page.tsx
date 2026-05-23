import { getEvent } from '@/actions/events';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
  const { data: guests } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('event_id', eventId);

  const totalGuests = guests?.length || 0;
  const confirmed = guests?.filter((g) => g.rsvp_status === 'accepted').length || 0;
  const pending = guests?.filter((g) => g.rsvp_status === 'pending').length || 0;
  const declined = guests?.filter((g) => g.rsvp_status === 'declined').length || 0;
  const responseRate = totalGuests > 0 ? Math.round(((confirmed + declined) / totalGuests) * 100) : 0;

  // Tasks for this event
  const { data: tasks } = await supabase
    .from('tasks')
    .select('completed')
    .eq('event_id', eventId);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.completed).length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Budget for this wedding (entries are linked via wedding_events.parent_event_id)
  const { data: budgetEntries } = await supabase
    .from('wedding_event_budgets')
    .select('planned_amount_inr, committed_amount_inr, paid_amount_inr, pending_amount_inr, wedding_events!inner(parent_event_id)')
    .eq('wedding_events.parent_event_id', eventId);

  const budget = (budgetEntries || []).reduce(
    (acc, e: any) => ({
      planned: acc.planned + (e.planned_amount_inr || 0),
      committed: acc.committed + (e.committed_amount_inr || 0),
      paid: acc.paid + (e.paid_amount_inr || 0),
      pending: acc.pending + (e.pending_amount_inr || 0),
    }),
    { planned: 0, committed: 0, paid: 0, pending: 0 }
  );

  const stats = [
    { label: 'Total Guests', value: totalGuests, sub: `${responseRate}% responded` },
    { label: 'Confirmed', value: confirmed, sub: `${pending} pending · ${declined} declined` },
    { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, sub: `${taskProgress}% complete` },
    { label: 'Budget Paid', value: formatINR(budget.paid), sub: `${formatINR(budget.pending)} pending` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">RSVP Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Confirmed', value: confirmed, color: 'bg-green-500' },
              { label: 'Pending', value: pending, color: 'bg-amber-500' },
              { label: 'Declined', value: declined, color: 'bg-red-500' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full ${row.color}`}
                    style={{ width: `${totalGuests > 0 ? (row.value / totalGuests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Budget Overview</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Planned</dt>
              <dd className="font-medium text-gray-900">{formatINR(budget.planned)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Committed</dt>
              <dd className="font-medium text-gray-900">{formatINR(budget.committed)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Paid</dt>
              <dd className="font-medium text-green-700">{formatINR(budget.paid)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Pending</dt>
              <dd className="font-medium text-amber-700">{formatINR(budget.pending)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
