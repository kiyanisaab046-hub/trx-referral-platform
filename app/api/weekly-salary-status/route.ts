import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RANK_PRICES: Record<number, number> = {
  5: 48,
  6: 96,
  7: 192,
  8: 384,
  9: 768,
  10: 1536,
};

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    let user;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get User's Highest Rank
    const { data: ranksData } = await supabase
      .from('user_ranks')
      .select('rank')
      .eq('user_id', user.id);
      
    let maxRank = 0;
    ranksData?.forEach(r => {
      if (r.rank > maxRank) maxRank = r.rank;
    });

    // 1.5 Get User's Direct Referrals Count
    const { count: directsCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', user.id);

    // 2. Get All Rewards to calculate total earned and pending amounts
    const { data: rewards } = await supabase
      .from('pending_weekly_rewards')
      .select('rank, amount, status')
      .eq('user_id', user.id);

    const rankStatus: Record<number, {
      status: 'locked' | 'active' | 'completed',
      totalEarned: number,
      maxCap: number,
      pendingAmount: number
    }> = {};

    for (let r = 5; r <= 10; r++) {
      const maxCap = RANK_PRICES[r] * 2;
      let totalEarned = 0;
      let pendingAmount = 0;

      rewards?.forEach(reward => {
        if (reward.rank === r) {
          totalEarned += Number(reward.amount);
          if (reward.status === 'pending') {
            pendingAmount += Number(reward.amount);
          }
        }
      });

      let status: 'locked' | 'active' | 'completed' = 'locked';
      if (maxRank >= r) {
        if (totalEarned >= maxCap) {
          status = 'completed';
        } else {
          status = 'active';
        }
      }

      rankStatus[r] = {
        status,
        totalEarned,
        maxCap,
        pendingAmount
      };
    }

    return NextResponse.json({ maxRank, rankStatus, directsCount: directsCount || 0 });

  } catch (error: any) {
    console.error('Status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
