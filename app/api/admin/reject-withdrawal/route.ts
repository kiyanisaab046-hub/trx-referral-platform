import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { withdrawId, userId, amount } = await req.json();
    if (!withdrawId || !userId || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Authenticate user as admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing auth header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 2. Fetch withdrawal to check status
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('status')
      .eq('id', withdrawId)
      .single();

    if (fetchError) throw fetchError;
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }
    if (withdrawal.status !== 'pending') {
       return NextResponse.json({ error: `Withdrawal already ${withdrawal.status}` }, { status: 400 });
    }

    // 3. Mark as rejected
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawId);
      
    if (updateError) throw updateError;

    // 4. Refund wallet
    const { data: wallet, error: walletFetchError } = await supabase
      .from('wallets')
      .select('main_balance')
      .eq('user_id', userId)
      .single();

    if (walletFetchError) throw walletFetchError;

    if (wallet) {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ main_balance: wallet.main_balance + amount })
        .eq('user_id', userId);
      
      if (walletError) throw walletError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
