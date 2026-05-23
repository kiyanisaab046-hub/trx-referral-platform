// app/api/nowpayments/webhook/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '../../../lib/supabase/server';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-api-key') || '';
  const body = await req.text();

  // Verify signature using secret key
  const secret = process.env.NOWPAYMENTS_SECRET_KEY || '';
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (hash !== signature) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const payload = JSON.parse(body);
  const { order_id, payment_status, pay_currency, price_amount, pay_amount, pay_address } = payload;

  // order_id format: `${userId}-${timestamp}`
  const userId = order_id?.split('-')[0];
  if (!userId) {
    return new NextResponse('Missing userId', { status: 400 });
  }

  const supabase = createClient();

  // Example: mark user as premium and add V balance (you can adjust logic)
  const updates: any = {};
  if (payment_status === 'finished') {
    updates.isPremium = true;
    // optional: add V tokens based on paid amount (simple 1:1 for demo)
    updates.v_balance = (payload.pay_amount as number) || 0;
  }

  const { error } = await supabase.from('users').update(updates).eq('id', userId);
  if (error) {
    console.error('Supabase update error', error);
    return new NextResponse('Supabase error', { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}
