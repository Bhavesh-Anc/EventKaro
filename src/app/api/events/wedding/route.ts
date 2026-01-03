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
    const {
      organizationId,
      title,
      slug,
      description,
      startDate,
      venueName,
      venueCity,
      capacity,
      weddingStyle,
      budgetRange,
      guestCountEstimate,
      totalBudget,
      weddingFunctions,
      brideName,
      groomName,
      brideFamilyName,
      groomFamilyName,
      primaryContactPhone,
    } = body;

    // Validate required fields
    if (!organizationId || !title || !startDate || !venueCity) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, title, startDate, venueCity' },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Generate slug if not provided
    const eventSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create the wedding event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organization_id: organizationId,
        title,
        slug: eventSlug,
        description,
        event_type: 'wedding',
        start_date: startDate,
        end_date: startDate, // Same day for main ceremony
        venue_type: 'physical',
        venue_name: venueName || null,
        venue_city: venueCity,
        capacity: capacity || 300,
        is_free: true,
        status: 'published',
        // New wedding-specific fields
        wedding_style: weddingStyle || 'traditional',
        budget_range: budgetRange || 'moderate',
        guest_count_estimate: guestCountEstimate || 'medium',
        total_budget_inr: totalBudget || null,
        wedding_functions: weddingFunctions || [],
        bride_name: brideName || null,
        groom_name: groomName || null,
        bride_family_name: brideFamilyName || null,
        groom_family_name: groomFamilyName || null,
        primary_contact_phone: primaryContactPhone || null,
        onboarding_completed: true,
      })
      .select('id')
      .single();

    if (eventError) {
      console.error('Error creating wedding event:', eventError);
      return NextResponse.json(
        { error: eventError.message || 'Failed to create wedding event' },
        { status: 500 }
      );
    }

    // Create default wedding sub-events based on selected functions
    if (weddingFunctions && weddingFunctions.length > 0 && event) {
      const weddingDate = new Date(startDate);
      const subEvents = [];

      // Map function IDs to event details with suggested timing
      const functionDetails: Record<string, { sequence: number; daysBefore: number; defaultTime: string }> = {
        engagement: { sequence: 1, daysBefore: 30, defaultTime: '11:00:00' },
        roka: { sequence: 2, daysBefore: 45, defaultTime: '11:00:00' },
        mehendi: { sequence: 3, daysBefore: 2, defaultTime: '14:00:00' },
        haldi: { sequence: 4, daysBefore: 1, defaultTime: '10:00:00' },
        sangeet: { sequence: 5, daysBefore: 1, defaultTime: '19:00:00' },
        cocktail: { sequence: 6, daysBefore: 1, defaultTime: '20:00:00' },
        wedding: { sequence: 7, daysBefore: 0, defaultTime: '09:00:00' },
        reception: { sequence: 8, daysBefore: 0, defaultTime: '19:00:00' },
        vidaai: { sequence: 9, daysBefore: 0, defaultTime: '23:00:00' },
      };

      for (const funcId of weddingFunctions) {
        const details = functionDetails[funcId];
        if (details) {
          const eventDate = new Date(weddingDate);
          eventDate.setDate(eventDate.getDate() - details.daysBefore);

          const startDateTime = new Date(eventDate);
          const [hours, minutes] = details.defaultTime.split(':').map(Number);
          startDateTime.setHours(hours, minutes, 0, 0);

          // End time is 4 hours after start by default
          const endDateTime = new Date(startDateTime);
          endDateTime.setHours(endDateTime.getHours() + 4);

          subEvents.push({
            parent_event_id: event.id,
            event_name: funcId,
            start_datetime: startDateTime.toISOString(),
            end_datetime: endDateTime.toISOString(),
            venue_name: venueName || null,
            status: 'scheduled',
            sequence_order: details.sequence,
          });
        }
      }

      if (subEvents.length > 0) {
        const { error: subEventError } = await supabase
          .from('wedding_events')
          .insert(subEvents);

        if (subEventError) {
          console.error('Error creating wedding sub-events:', subEventError);
          // Don't fail the whole request, just log the error
        }
      }
    }

    // Create initial budget entries based on budget range
    if (event && budgetRange && totalBudget) {
      const budgetAllocations = getBudgetAllocations(budgetRange, totalBudget);

      const { error: budgetError } = await supabase
        .from('wedding_event_budgets')
        .insert(
          budgetAllocations.map(allocation => ({
            event_id: event.id,
            category: allocation.category,
            planned_amount_inr: allocation.amount,
            committed_amount_inr: 0,
            paid_amount_inr: 0,
            pending_amount_inr: 0,
            description: allocation.description,
          }))
        );

      if (budgetError) {
        console.error('Error creating initial budget:', budgetError);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/events');

    return NextResponse.json({ eventId: event.id, success: true });
  } catch (error) {
    console.error('Wedding creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getBudgetAllocations(budgetRange: string, totalBudget: number) {
  // Standard Indian wedding budget allocation percentages
  const allocations = [
    { category: 'venue', percentage: 0.20, description: 'Venue rental and setup' },
    { category: 'catering', percentage: 0.28, description: 'Food and beverages for all events' },
    { category: 'photography', percentage: 0.12, description: 'Photography and videography' },
    { category: 'decoration', percentage: 0.12, description: 'Flowers, mandap, and decor' },
    { category: 'entertainment', percentage: 0.08, description: 'DJ, band, and performances' },
    { category: 'makeup', percentage: 0.05, description: 'Bridal and family makeup' },
    { category: 'transport', percentage: 0.05, description: 'Guest transportation and cars' },
    { category: 'accommodation', percentage: 0.05, description: 'Hotel bookings for guests' },
    { category: 'other', percentage: 0.05, description: 'Miscellaneous and contingency' },
  ];

  return allocations.map(a => ({
    category: a.category,
    amount: Math.round(totalBudget * a.percentage),
    description: a.description,
  }));
}
