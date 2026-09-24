import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { withdrawId } = await req.json();
    if (!withdrawId) {
      return NextResponse.json({ error: 'Missing withdrawId' }, { status: 400 });
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

    // 2. Fetch withdrawal details
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('amount, user_id, status')
      .eq('id', withdrawId)
      .single();

    if (fetchError) throw fetchError;
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }
    if (withdrawal.status === 'approved') {
       return NextResponse.json({ error: 'Withdrawal already approved' }, { status: 400 });
    }

    // 3. Update status to approved
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', withdrawId);
      
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
