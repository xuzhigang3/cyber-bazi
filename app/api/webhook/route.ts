import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Helper to verify Lemon Squeezy webhook signature
async function verifySignature(text: string, sig: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signature = new Uint8Array(
    (sig.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16))
  );

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(text)
  );
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured.');
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    const sig = req.headers.get('x-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing x-signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = await verifySignature(rawBody, sig, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = req.headers.get('x-event-name') || payload.meta?.event_name;

    console.log(`Received Lemon Squeezy event: ${eventName}`);

    if (eventName === 'order_created') {
      const customData = payload.meta?.custom_data;
      const orderId = customData?.order_id;

      if (orderId) {
        const { env } = getRequestContext();
        await env.DB.prepare('UPDATE reports SET is_paid = 1 WHERE id = ?').bind(orderId).run();
        console.log(`Order ${orderId} successfully marked as paid via Lemon Squeezy.`);
      } else {
        console.warn('No order_id found in custom_data');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
