import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Authenticate user via bearer token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session expired' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const durationWatched = Number(body.durationWatched) || 0;

    // 2. Fetch global ad settings
    const { data: settings } = await supabase
      .from('ad_settings')
      .select('*')
      .eq('id', 1)
      .single();

    const config = settings || {
      is_enabled: true,
      daily_limit_per_user: 10,
      cooldown_seconds: 30,
      reward_amount: 0.05,
      watch_duration_seconds: 15
    };

    if (!config.is_enabled) {
      return NextResponse.json({ error: 'Watch & Earn is currently disabled by admin' }, { status: 403 });
    }

    // 3. Anti-Cheat: Validate watch duration
    if (durationWatched < config.watch_duration_seconds) {
      return NextResponse.json({
        error: `Incomplete watch! You must watch for at least ${config.watch_duration_seconds} seconds.`
      }, { status: 400 });
    }

    // 4. Verify Daily Limit
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: viewsToday, error: viewsError } = await supabase
      .from('ad_views')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (viewsError) throw viewsError;

    const countToday = (viewsToday || []).length;
    if (countToday >= config.daily_limit_per_user) {
      return NextResponse.json({
        error: `Daily limit reached! You have already watched ${countToday}/${config.daily_limit_per_user} ads today. Come back tomorrow!`
      }, { status: 429 });
    }

    // 5. Verify Cooldown between ads
    if (countToday > 0 && viewsToday[0]?.created_at) {
      const lastWatchTime = new Date(viewsToday[0].created_at).getTime();
      const elapsedSeconds = Math.floor((Date.now() - lastWatchTime) / 1000);
      if (elapsedSeconds < config.cooldown_seconds) {
        const remainingCooldown = config.cooldown_seconds - elapsedSeconds;
        return NextResponse.json({
          error: `Cooldown active. Please wait ${remainingCooldown}s before watching another ad.`
        }, { status: 429 });
      }
    }

    const rewardAmount = Number(config.reward_amount);

    // 6. Record the view in ad_views
    const { error: insertViewError } = await supabase
      .from('ad_views')
      .insert({
        user_id: user.id,
        reward_amount: rewardAmount,
        duration_watched: durationWatched,
        ip_address: req.headers.get('x-forwarded-for') || null
      });

    if (insertViewError) {
      console.error('Failed to log ad_views:', insertViewError);
    }

    // 7. Credit user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, main_balance, income_balance')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      throw new Error('User wallet not found');
    }

    const newIncomeBalance = Number(wallet.income_balance || 0) + rewardAmount;
    const newMainBalance = Number(wallet.main_balance || 0) + rewardAmount;

    const { error: updateWalletError } = await supabase
      .from('wallets')
      .update({
        main_balance: newMainBalance,
        income_balance: newIncomeBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateWalletError) throw updateWalletError;

    // 8. Add ledger record in transactions
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'commission_reward',
        description: `Watch & Earn Ad Reward (+$${rewardAmount})`
      });

    return NextResponse.json({
      success: true,
      rewardCredited: rewardAmount,
      watchedToday: countToday + 1,
      remainingToday: Math.max(0, config.daily_limit_per_user - (countToday + 1)),
      newIncomeBalance: parseFloat(newIncomeBalance.toFixed(4)),
      cooldownSeconds: config.cooldown_seconds
    });

  } catch (error: any) {
    console.error('Ad claim error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
