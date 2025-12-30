import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TimelineView } from '@/components/features/timeline-view';

/**
 * EVENTS & TIMELINE TAB
 *
 * Single source of truth for the entire wedding
 * Where time, vendors, guests, transport, and money intersect
 * Used daily before the wedding, minute-by-minute on wedding days
 */
export default async function TimelinePage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Fetch wedding event
  const { data: weddingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .eq('event_type', 'wedding')
    .order('start_date', { ascending: true })
    .limit(1);

  const weddingEvent = weddingEvents?.[0];

  if (!weddingEvent) {
    redirect('/events/new');
  }

  // Fetch all wedding sub-events with complete data
  // Note: vendor table is "vendors" with "business_type" column (not "category")
  const { data: weddingSubEvents, error: subEventsError } = await supabase
    .from('wedding_events')
    .select(`
      *,
      vendor_assignments:wedding_event_vendor_assignments(
        id,
        status,
        scope,
        arrival_time,
        vendors(
          id,
          business_name,
          business_type,
          phone,
          email
        )
      ),
      budget:wedding_event_budgets(
        id,
        allocated_amount,
        spent_amount,
        committed_amount
      )
    `)
    .eq('parent_event_id', weddingEvent.id)
    .order('start_datetime', { ascending: true });

  if (subEventsError) {
    console.error('Error fetching wedding sub-events:', subEventsError);
  }

  // Format events for timeline component
  const timelineEvents = weddingSubEvents?.map((e: any) => ({
    id: e.id,
    event_name: e.event_name,
    custom_event_name: e.custom_event_name,
    description: e.description,
    start_datetime: e.start_datetime,
    end_datetime: e.end_datetime,
    duration_minutes: e.duration_minutes,
    venue_name: e.venue_name,
    venue_address: e.venue_address,
    venue_city: e.venue_city,
    venue_state: e.venue_state,
    venue_latitude: e.venue_latitude,
    venue_longitude: e.venue_longitude,
    venue_type: e.venue_type,
    expected_guest_count: e.expected_guest_count,
    guest_subset: e.guest_subset,
    dress_code: e.dress_code,
    color_theme: e.color_theme,
    transport_required: e.transport_required,
    status: e.status,
    vendor_assignments: e.vendor_assignments,
    budget: e.budget?.[0] || null,
    budget_allocated: e.budget?.[0]?.allocated_amount || 0,
    has_transport: e.transport_required || false,
    transport_assigned: false, // TODO: Check actual transport assignments
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Timeline</h1>
          <p className="text-gray-600 mt-1">
            Manage all your wedding events in one place
          </p>
        </div>
      </div>

      {/* Timeline View */}
      <TimelineView
        events={timelineEvents}
        parentEventId={weddingEvent.id}
        weddingDate={weddingEvent.start_date}
      />
    </div>
  );
}
