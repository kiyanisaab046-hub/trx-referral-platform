// app/api/create-order/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, description, userId } = await req.json();
  const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NEXT_PUBLIC_NOWPAYMENTS_PUBLIC_KEY;
  const payload = {
    price_amount: amount,
    price_currency: 'USD', // base currency
    pay_currency: (process.env.NOWPAYMENTS_CURRENCY || 'bnbbsc').toLowerCase() === 'bnb' ? 'bnbbsc' : (process.env.NOWPAYMENTS_CURRENCY || 'bnbbsc').toLowerCase(),
    ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/nowpayments/webhook`,
    order_id: `${userId}-${Date.now()}`,
    order_description: description
  };

  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey as string
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (data.invoice_url) {
    return NextResponse.json({ checkoutUrl: data.invoice_url });
  } else {
    return NextResponse.json({ error: data.message || 'Failed to create invoice', details: data }, { status: 400 });
  }
}
