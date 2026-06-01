import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RANK_PERCENTAGES = {
  5: 0.04,
  6: 0.03,
  7: 0.025,
  8: 0.02,
  9: 0.0175,
  10: 0.0175,
};

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Authenticate user as admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 2. Get last distribution date
    const { data: lastDistributions } = await supabase
      .from('weekly_distributions')
      .select('distributed_at')
      .order('distributed_at', { ascending: false })
      .limit(1);

    const lastDistDate = lastDistributions && lastDistributions.length > 0 
      ? lastDistributions[0].distributed_at 
      : '1970-01-01T00:00:00Z';

    // 3. Calculate Global Business since last distribution
    let totalBusiness = 0;
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('type', 'rank_purchase')
        .gt('created_at', lastDistDate)
        .range(offset, offset + limit - 1);

      if (error) throw error;
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      data.forEach(tx => {
        totalBusiness += Math.abs(Number(tx.amount) || 0);
      });
      if (data.length < limit) hasMore = false;
      else offset += limit;
    }

    if (totalBusiness <= 0) {
      return NextResponse.json({ message: 'No new global business to distribute.' });
    }

    // 4. Fetch Qualifiers (Highest Rank per User)
    const { data: allRanks, error: ranksError } = await supabase
      .from('user_ranks')
      .select('user_id, rank');
      
    if (ranksError) throw ranksError;

    const userHighestRank: Record<string, number> = {};
    allRanks?.forEach(r => {
      if (!userHighestRank[r.user_id] || r.rank > userHighestRank[r.user_id]) {
        userHighestRank[r.user_id] = r.rank;
      }
    });

    const rankCounts: Record<number, string[]> = {
      5: [], 6: [], 7: [], 8: [], 9: [], 10: []
    };

    Object.entries(userHighestRank).forEach(([userId, rank]) => {
      if (rank >= 5 && rank <= 10) {
        rankCounts[rank].push(userId);
      }
    });

    // 5. Create Distribution Record
    const { data: newDist, error: distError } = await supabase
      .from('weekly_distributions')
      .insert({ total_business: totalBusiness })
      .select('id')
      .single();

    if (distError) throw distError;
    const distributionId = newDist.id;

    // 6. Calculate and Insert Pending Rewards
    const pendingRewards = [];
    
    for (const [rankStr, percentage] of Object.entries(RANK_PERCENTAGES)) {
      const rank = parseInt(rankStr);
      const qualifiers = rankCounts[rank];
      if (qualifiers.length > 0) {
        const rankPool = totalBusiness * percentage;
        const exactShare = Number((rankPool / qualifiers.length).toFixed(2));
        
        for (const userId of qualifiers) {
          pendingRewards.push({
            user_id: userId,
            distribution_id: distributionId,
            rank: rank,
            amount: exactShare,
            status: 'pending'
          });
        }
      }
    }

    if (pendingRewards.length > 0) {
      const { error: insertError } = await supabase
        .from('pending_weekly_rewards')
        .insert(pendingRewards);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      totalBusiness,
      rewardsCount: pendingRewards.length
    });

  } catch (error: any) {
    console.error('Distribute weekly error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
