import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendGenericEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendSMSMessage } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: dueReminders, error: fetchError } = await supabase
    .from('reminders')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)
    .limit(50);

  if (fetchError) {
    console.error('[cron] Failed to fetch reminders:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!dueReminders || dueReminders.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, message: 'No reminders due' });
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const reminder of dueReminders) {
    try {
      let recipientsSent = 0;

      if (reminder.recipients !== 'team') {
        let guestQuery = supabase
          .from('guests')
          .select('name, email, whatsapp_number, phone, rsvp_status')
          .eq('event_id', reminder.event_id);

        if (reminder.recipients === 'pending_rsvp') {
          guestQuery = guestQuery.eq('rsvp_status', 'pending');
        } else if (reminder.recipients === 'confirmed_guests') {
          guestQuery = guestQuery.eq('rsvp_status', 'accepted');
        } else if (reminder.recipients === 'specific' && reminder.recipient_ids?.length) {
          guestQuery = guestQuery.in('id', reminder.recipient_ids);
        }

        const { data: recipients } = await guestQuery;

        for (const g of recipients || []) {
          const sendVia = reminder.send_via || ['email'];

          if (sendVia.includes('email') && g.email) {
            await sendGenericEmail(g.email, reminder.title, reminder.message);
            recipientsSent++;
          }

          const waNumber = g.whatsapp_number || g.phone;
          if (sendVia.includes('whatsapp') && waNumber) {
            await sendWhatsAppMessage(waNumber, `${reminder.title}\n\n${reminder.message}`);
          }

          if (sendVia.includes('sms') && g.phone) {
            await sendSMSMessage(g.phone, `${reminder.title}\n\n${reminder.message}`);
          }
        }
      }

      await supabase
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', reminder.id);

      sentCount++;
      console.log(`[cron] Sent reminder ${reminder.id} to ${recipientsSent} recipients`);
    } catch (err) {
      console.error(`[cron] Failed to send reminder ${reminder.id}:`, err);

      await supabase
        .from('reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);

      failedCount++;
    }
  }

  return NextResponse.json({
    sent: sentCount,
    failed: failedCount,
    total: dueReminders.length,
  });
}
