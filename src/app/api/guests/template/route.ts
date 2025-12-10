import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');

  // CSV template content
  const csvContent = `first_name,last_name,email,phone,group_name,plus_one_allowed
John,Doe,john.doe@example.com,+91 98765 43210,Family,true
Jane,Smith,jane.smith@example.com,+91 98765 43211,Friends,false
Bob,Johnson,bob@example.com,,Colleagues,true
Alice,Williams,alice@example.com,+91 12345 67890,Family,true`;

  // Create response with CSV content
  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="guest-import-template-${eventId || 'sample'}.csv"`,
    },
  });

  return response;
}
