// Env-gated messaging adapters (WhatsApp / SMS).
//
// No provider keys are configured yet, so these helpers log and no-op instead
// of attempting a real send. Wire a provider (e.g. WhatsApp Business Cloud API,
// Twilio) inside the `*_ENABLED` branches when credentials are available.

const WHATSAPP_ENABLED = Boolean(
  process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
);
const SMS_ENABLED = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER
);

export interface MessageResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<MessageResult> {
  if (!WHATSAPP_ENABLED) {
    console.warn(`[whatsapp] not configured — skipping message to ${to}`);
    return { success: true, skipped: true };
  }

  try {
    // TODO: Replace with a real WhatsApp Business Cloud API call when credentials exist.
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error('[whatsapp] send failed:', detail);
      return { success: false, error: `WhatsApp API error (${res.status})` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[whatsapp] send error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendSMSMessage(to: string, message: string): Promise<MessageResult> {
  if (!SMS_ENABLED) {
    console.warn(`[sms] not configured — skipping message to ${to}`);
    return { success: true, skipped: true };
  }

  try {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      To: to,
      From: process.env.TWILIO_FROM_NUMBER!,
      Body: message,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[sms] send failed:', detail);
      return { success: false, error: `SMS API error (${res.status})` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[sms] send error:', error);
    return { success: false, error: error.message };
  }
}
