// app/api/withdraw/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, currency, address, orderId } = await request.json();

    // Build NowPayments payout payload
    const payoutPayload = {
      price_amount: amount, // amount in USD (or your chosen base currency)
      price_currency: 'usd',
      pay_currency: currency, // e.g., 'bnb'
      pay_address: address,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipn`, // optional IPN endpoint
      order_id: orderId,
    };

    const response = await fetch('https://api.nowpayments.io/v1/payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY as string,
      },
      body: JSON.stringify(payoutPayload),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('NowPayments withdrawal error', error);
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
