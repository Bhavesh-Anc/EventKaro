import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');

  if (!eventId) {
    return new NextResponse('Event ID is required', { status: 400 });
  }

  const supabase = await createClient();

  // Fetch all guests for the event
  const { data: guests, error } = await supabase
    .from('guests')
    .select(`
      *,
      guest_group:guest_groups(name),
      dietary_preferences:guest_dietary_preferences(preference)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error || !guests) {
    return new NextResponse('Failed to fetch guests', { status: 500 });
  }

  // Create CSV content
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'RSVP Status',
    'Group',
    'Plus One Allowed',
    'Plus One Name',
    'Plus One RSVP',
    'Dietary Preferences',
    'Checked In',
    'Notes',
    'Source',
    'Created At',
  ];

  const csvRows = [headers.join(',')];

  guests.forEach((guest: any) => {
    const dietaryPrefs = guest.dietary_preferences
      ?.map((d: any) => d.preference)
      .join('; ') || '';

    const row = [
      guest.first_name || '',
      guest.last_name || '',
      guest.email || '',
      guest.phone || '',
      guest.rsvp_status || '',
      guest.guest_group?.name || '',
      guest.plus_one_allowed ? 'Yes' : 'No',
      guest.plus_one_name || '',
      guest.plus_one_rsvp || '',
      dietaryPrefs,
      guest.checked_in ? 'Yes' : 'No',
      (guest.notes || '').replace(/,/g, ';'),
      guest.source || '',
      new Date(guest.created_at).toLocaleDateString(),
    ];

    csvRows.push(row.map((cell) => `"${cell}"`).join(','));
  });

  const csvContent = csvRows.join('\n');

  // Create response with CSV content
  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="guests-export-${eventId}-${Date.now()}.csv"`,
    },
  });

  return response;
}
