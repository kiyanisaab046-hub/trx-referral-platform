import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse optional rank filter from body
    const body = await req.json().catch(() => ({}));
    const rankFilter: number | undefined = body.rank;

    // Build query to fetch pending rewards for user
    let query = supabase
      .from('pending_weekly_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    // If a specific rank is requested, filter by that rank only
    if (rankFilter && typeof rankFilter === 'number') {
      query = query.eq('rank', rankFilter);
    }

    const { data: rewards, error: rewardError } = await query;

    if (rewardError) throw rewardError;

    if (!rewards || rewards.length === 0) {
      return NextResponse.json({ error: 'No pending rewards found' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = rewards.reduce((sum, r) => sum + Number(r.amount), 0);
    const rewardIds = rewards.map(r => r.id);

    // Update Reward Statuses
    const { error: updateRewardError } = await supabase
      .from('pending_weekly_rewards')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .in('id', rewardIds)
      .eq('status', 'pending'); // optimistic locking

    if (updateRewardError) {
      throw updateRewardError;
    }

    // Fetch Wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) throw new Error('Wallet not found');

    // Update Wallet
    const { error: updateWalletError } = await supabase
      .from('wallets')
      .update({
        main_balance: wallet.main_balance + totalAmount,
        income_balance: wallet.income_balance + totalAmount
      })
      .eq('user_id', user.id);

    if (updateWalletError) throw updateWalletError;

    // Insert Transaction Ledger — log which rank(s) were claimed
    const ranksClaimed = Array.from(new Set(rewards.map(r => r.rank))).join(', ');
    const description = rankFilter
      ? `Claimed Weekly Income (Rank ${rankFilter})`
      : `Claimed Weekly Income (Ranks ${ranksClaimed})`;

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: totalAmount,
        type: 'commission_salary',
        description
      });

    if (txError) {
      console.error('Failed to log transaction, but balance updated', txError);
    }

    return NextResponse.json({ success: true, amount: totalAmount, rank: rankFilter || null });

  } catch (error: any) {
    console.error('Claim weekly reward error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
