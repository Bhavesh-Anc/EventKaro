import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'invitations@eventkaro.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'EventKaro';

export interface InvitationEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  invitationUrl: string;
}

export interface RSVPConfirmationEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  rsvpStatus: string;
}

/**
 * Send an invitation email to a guest
 */
export async function sendInvitationEmail(data: InvitationEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.guestEmail,
      subject: `You're invited to ${data.eventTitle}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .event-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white !important;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.guestName},</p>
              <p>You're invited to an amazing event and we'd love to have you join us!</p>

              <div class="event-details">
                <h2 style="margin-top: 0; color: #667eea;">${data.eventTitle}</h2>
                <p style="margin: 8px 0;">
                  <strong>📅 When:</strong> ${data.eventDate}
                </p>
                ${data.eventLocation ? `
                  <p style="margin: 8px 0;">
                    <strong>📍 Where:</strong> ${data.eventLocation}
                  </p>
                ` : ''}
              </div>

              <p>Please RSVP by clicking the button below. You'll be able to:</p>
              <ul>
                <li>Confirm your attendance</li>
                <li>Add plus ones (if allowed)</li>
                <li>Share dietary requirements</li>
                <li>Provide travel and accommodation details</li>
              </ul>

              <div style="text-align: center;">
                <a href="${data.invitationUrl}" class="button">
                  RSVP Now
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Can't click the button? Copy and paste this link into your browser:<br>
                <a href="${data.invitationUrl}" style="color: #667eea; word-break: break-all;">${data.invitationUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Looking forward to seeing you!</p>
              <p style="margin-top: 20px;">
                Powered by <strong>EventKaro</strong> - Making event management simple
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send RSVP confirmation email
 */
export async function sendRSVPConfirmationEmail(data: RSVPConfirmationEmailData) {
  try {
    const statusEmoji = data.rsvpStatus === 'accepted' ? '✅' : data.rsvpStatus === 'declined' ? '❌' : '❓';
    const statusText = data.rsvpStatus === 'accepted' ? 'confirmed your attendance' :
                       data.rsvpStatus === 'declined' ? 'declined the invitation' :
                       'marked yourself as maybe attending';

    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.guestEmail,
      subject: `RSVP Confirmation - ${data.eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .confirmation {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                border: 2px solid ${data.rsvpStatus === 'accepted' ? '#10b981' : '#ef4444'};
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">${statusEmoji} RSVP Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${data.guestName},</p>
              <p>Thank you for responding to our invitation!</p>

              <div class="confirmation">
                <h2 style="margin-top: 0; color: ${data.rsvpStatus === 'accepted' ? '#10b981' : '#ef4444'};">
                  ${data.eventTitle}
                </h2>
                <p style="font-size: 18px; margin: 20px 0;">
                  You have ${statusText}
                </p>
                <p style="margin: 8px 0;">
                  <strong>📅 Date:</strong> ${data.eventDate}
                </p>
                ${data.eventLocation ? `
                  <p style="margin: 8px 0;">
                    <strong>📍 Location:</strong> ${data.eventLocation}
                  </p>
                ` : ''}
              </div>

              ${data.rsvpStatus === 'accepted' ? `
                <p>We're excited to have you join us! If you need to update your RSVP or add any details, you can do so using your original invitation link.</p>
                <p><strong>What to expect next:</strong></p>
                <ul>
                  <li>You'll receive event updates and reminders</li>
                  <li>Any important information will be sent to this email</li>
                  <li>You can update your details anytime</li>
                </ul>
              ` : data.rsvpStatus === 'declined' ? `
                <p>We're sorry you can't make it! If your plans change, you can always update your RSVP using your original invitation link.</p>
              ` : `
                <p>We understand you're not sure yet. No worries! You can update your RSVP anytime using your original invitation link.</p>
              `}
            </div>
            <div class="footer">
              <p>Thank you for your response!</p>
              <p style="margin-top: 20px;">
                Powered by <strong>EventKaro</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending RSVP confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (error: any) {
    console.error('Error sending RSVP confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a test email (for debugging)
 */
export async function sendTestEmail(to: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'EventKaro Email Test',
      html: '<p>This is a test email from EventKaro. If you received this, email integration is working!</p>',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
