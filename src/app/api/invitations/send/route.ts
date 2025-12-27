import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, guestEmail, eventTitle, eventDate, eventLocation, invitationUrl } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !eventTitle || !eventDate || !invitationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send the invitation email
    const result = await sendInvitationEmail({
      guestName,
      guestEmail,
      eventTitle,
      eventDate,
      eventLocation,
      invitationUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Error in send invitation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
