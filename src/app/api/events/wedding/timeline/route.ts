import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parentEventId, events } = body;

    if (!parentEventId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Missing required fields: parentEventId and events array' },
        { status: 400 }
      );
    }

    // Verify user has access to this event
    const { data: event } = await supabase
      .from('events')
      .select('id, organization_id')
      .eq('id', parentEventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', event.organization_id)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete existing wedding events for this parent
    await supabase
      .from('wedding_events')
      .delete()
      .eq('parent_event_id', parentEventId);

    // Create new wedding events
    const weddingEvents = events.map((e: any, index: number) => ({
      parent_event_id: parentEventId,
      event_name: e.eventName,
      custom_event_name: e.customEventName || null,
      start_datetime: e.startDatetime,
      end_datetime: e.endDatetime,
      venue_name: e.venueName || null,
      dress_code: e.dressCode || null,
      description: e.description || null,
      status: 'scheduled',
      sequence_order: index + 1,
    }));

    const { error: insertError } = await supabase
      .from('wedding_events')
      .insert(weddingEvents);

    if (insertError) {
      console.error('Error creating wedding events:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create timeline' },
        { status: 500 }
      );
    }

    revalidatePath(`/events/${parentEventId}`);
    revalidatePath(`/events/${parentEventId}/wedding-timeline`);
    revalidatePath('/dashboard');
    revalidatePath('/timeline');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Timeline creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
