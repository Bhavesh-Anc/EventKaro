import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TimelineView } from '@/components/features/timeline-view';
import { UnifiedTimeline, type TimelineTask, type TimelineVendorBooking, type TimelineEvent as UnifiedTimelineEvent } from '@/components/features/unified-timeline';
import { TimelinePageClient } from '@/components/features/timeline-page-client';

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
  const { data: weddingSubEvents, error: subEventsError } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('parent_event_id', weddingEvent.id)
    .order('start_datetime', { ascending: true });

  if (subEventsError) {
    console.error('Error fetching wedding sub-events:', subEventsError);
  }

  // Fetch tasks with due dates for this organization
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', currentOrg.id)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true });

  // Fetch vendor bookings with payment schedules
  const { data: vendorBookings } = await supabase
    .from('wedding_event_budgets')
    .select(`
      id,
      vendor_id,
      category,
      pending_amount_inr,
      paid_amount_inr,
      payment_due_date,
      vendors:vendor_profiles(id, business_name, category)
    `)
    .not('vendor_id', 'is', null);

  // Format events for unified timeline
  const unifiedEvents: UnifiedTimelineEvent[] = (weddingSubEvents || []).map((e: any) => ({
    id: e.id,
    event_name: e.event_name,
    custom_event_name: e.custom_event_name,
    start_datetime: e.start_datetime,
    end_datetime: e.end_datetime,
    venue_name: e.venue_name,
    expected_guest_count: e.expected_guest_count,
    status: e.status === 'completed' ? 'ready' : e.status === 'cancelled' ? 'conflict' : 'attention',
  }));

  // Format tasks for unified timeline
  const unifiedTasks: TimelineTask[] = (tasksData || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    due_date: t.due_date,
    completed: t.completed || false,
    priority: t.priority || 'medium',
    category: t.category,
  }));

  // Format vendor bookings for unified timeline
  const unifiedVendorBookings: TimelineVendorBooking[] = (vendorBookings || [])
    .filter((b: any) => b.payment_due_date)
    .map((b: any) => ({
      id: b.id,
      vendor_name: b.vendors?.business_name || 'Unknown Vendor',
      vendor_category: b.vendors?.category || b.category || 'Other',
      payment_due_date: b.payment_due_date,
      amount_pending: b.pending_amount_inr || 0,
      status: b.pending_amount_inr === 0 ? 'paid' : 'pending',
    }));

  // Format events for original timeline component (Wedding Day Mode)
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
    vendor_assignments: [],
    budget: undefined,
    budget_allocated: 0,
    has_transport: e.transport_required || false,
    transport_assigned: false,
  })) || [];

  return (
    <TimelinePageClient
      timelineEvents={timelineEvents}
      unifiedEvents={unifiedEvents}
      unifiedTasks={unifiedTasks}
      unifiedVendorBookings={unifiedVendorBookings}
      parentEventId={weddingEvent.id}
      weddingDate={weddingEvent.start_date}
    />
  );
}
