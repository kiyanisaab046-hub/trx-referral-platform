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

// GET: Fetch ad settings + user stats (watched today, remaining, cooldown)
export async function GET(req: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Fetch global ad settings
    const { data: settings, error: settingsError } = await supabase
      .from('ad_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching ad settings:', settingsError);
    }

    const defaultSettings = {
      is_enabled: true,
      daily_limit_per_user: 10,
      cooldown_seconds: 30,
      reward_amount: 0.05,
      watch_duration_seconds: 15,
      ad_network_url: 'https://omg10.com/4/11881517'
    };

    const currentSettings = settings || defaultSettings;

    // 2. If user is authenticated, calculate their watch stats today
    let userStats = {
      watchedToday: 0,
      remainingToday: currentSettings.daily_limit_per_user,
      canWatch: currentSettings.is_enabled,
      secondsUntilNextAd: 0,
      totalEarned: 0
    };

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        // Today's start in UTC
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        // Fetch user's ad views today
        const { data: viewsToday, error: viewsError } = await supabase
          .from('ad_views')
          .select('created_at, reward_amount')
          .eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString())
          .order('created_at', { ascending: false });

        if (!viewsError && viewsToday) {
          const count = viewsToday.length;
          const remaining = Math.max(0, currentSettings.daily_limit_per_user - count);
          
          // Calculate cooldown
          let secondsUntilNext = 0;
          if (count > 0 && viewsToday[0]?.created_at) {
            const lastWatchTime = new Date(viewsToday[0].created_at).getTime();
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastWatchTime) / 1000);
            secondsUntilNext = Math.max(0, currentSettings.cooldown_seconds - elapsedSeconds);
          }

          // Total earned by user from ads
          const { data: allViews } = await supabase
            .from('ad_views')
            .select('reward_amount')
            .eq('user_id', user.id);

          const totalEarned = (allViews || []).reduce((acc, row) => acc + Number(row.reward_amount || 0), 0);

          userStats = {
            watchedToday: count,
            remainingToday: remaining,
            canWatch: currentSettings.is_enabled && remaining > 0 && secondsUntilNext === 0,
            secondsUntilNextAd: secondsUntilNext,
            totalEarned: parseFloat(totalEarned.toFixed(4))
          };
        }
      }
    }

    return NextResponse.json({
      settings: currentSettings,
      userStats
    });
  } catch (error: any) {
    console.error('Ad settings GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Admin updates ad settings
export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabase();

    // Check admin authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      is_enabled,
      daily_limit_per_user,
      cooldown_seconds,
      reward_amount,
      watch_duration_seconds,
      ad_network_url
    } = body;

    const { data: updated, error: updateError } = await supabase
      .from('ad_settings')
      .upsert({
        id: 1,
        is_enabled: Boolean(is_enabled),
        daily_limit_per_user: Number(daily_limit_per_user) || 10,
        cooldown_seconds: Number(cooldown_seconds) || 30,
        reward_amount: Number(reward_amount) || 0.05,
        watch_duration_seconds: Number(watch_duration_seconds) || 15,
        ad_network_url: String(ad_network_url || '').trim(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Ad settings POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
