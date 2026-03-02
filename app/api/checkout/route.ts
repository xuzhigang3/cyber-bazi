import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { id, email } = (await req.json()) as { id: string; email?: string };

    const { env } = getRequestContext();
    const db = env.DB;

    // Check if report exists
    const report = await db.prepare('SELECT * FROM reports WHERE id = ?').bind(id).first<any>();
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      throw new Error('Lemon Squeezy configuration (API_KEY, STORE_ID, VARIANT_ID) is required.');
    }

    const appUrl = process.env.APP_URL || new URL(req.url).origin;

    // Create Lemon Squeezy Checkout
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: email || '',
              custom: {
                order_id: id
              }
            },
            product_options: {
              redirect_url: `${appUrl}/?success=true&orderId=${id}`
            },
            checkout_options: {
              embed: true,
              media: false,
              logo: true
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lemon Squeezy API error:', errorData);
      throw new Error('Failed to create Lemon Squeezy checkout');
    }

    const checkoutData = (await response.json()) as any;
    const checkoutUrl = checkoutData.data.attributes.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
