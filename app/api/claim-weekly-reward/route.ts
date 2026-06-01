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

    const { rewardId } = await req.json();
    if (!rewardId) {
      return NextResponse.json({ error: 'Missing reward ID' }, { status: 400 });
    }

    // Verify the reward belongs to the user and is pending
    const { data: reward, error: rewardError } = await supabase
      .from('pending_weekly_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Reward not found or already claimed' }, { status: 400 });
    }

    // Use a Supabase RPC if available, or sequential updates
    // Update Reward Status
    const { error: updateRewardError } = await supabase
      .from('pending_weekly_rewards')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', rewardId)
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
        main_balance: wallet.main_balance + reward.amount,
        income_balance: wallet.income_balance + reward.amount
      })
      .eq('user_id', user.id);

    if (updateWalletError) throw updateWalletError;

    // Insert Transaction Ledger
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: reward.amount,
        type: 'commission_salary',
        description: `Claimed Weekly Salary (Rank ${reward.rank})`
      });

    if (txError) {
      console.error('Failed to log transaction, but balance updated', txError);
    }

    return NextResponse.json({ success: true, amount: reward.amount });

  } catch (error: any) {
    console.error('Claim weekly reward error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
