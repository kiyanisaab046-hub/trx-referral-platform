// app/api/create-order/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, description, userId } = await req.json();
  const apiKey = process.env.NOWPAYMENTS_SECRET_KEY;
  const payload = {
    price_amount: amount,
    price_currency: 'USD', // base currency
    pay_currency: process.env.NOWPAYMENTS_CURRENCY || 'BNB',
    ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/nowpayments/webhook`,
    order_id: `${userId}-${Date.now()}`,
    order_description: description,
    buyer_name: 'User',
    sandbox: true // set false in production
  };

  const response = await fetch('https://api.nowpayments.io/v2/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey as string
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return NextResponse.json({ checkoutUrl: data.checkout_url });
}
