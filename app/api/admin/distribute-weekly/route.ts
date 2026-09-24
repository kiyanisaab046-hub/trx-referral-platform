import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RANK_PERCENTAGES: Record<number, number> = {
  5: 0.04,
  6: 0.03,
  7: 0.025,
  8: 0.02,
  9: 0.0175,
  10: 0.0175,
};

const RANK_PRICES: Record<number, number> = {
  5: 48,
  6: 96,
  7: 192,
  8: 384,
  9: 768,
  10: 1536,
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

    // 4. Fetch All Previous Earnings to Calculate Caps
    const { data: allRewards, error: rewardsError } = await supabase
      .from('pending_weekly_rewards')
      .select('user_id, rank, amount');
    
    if (rewardsError) throw rewardsError;

    // Track how much each user has earned per rank
    const userEarningsByRank: Record<string, Record<number, number>> = {};
    allRewards?.forEach(reward => {
      if (!userEarningsByRank[reward.user_id]) userEarningsByRank[reward.user_id] = {};
      if (!userEarningsByRank[reward.user_id][reward.rank]) userEarningsByRank[reward.user_id][reward.rank] = 0;
      userEarningsByRank[reward.user_id][reward.rank] += Number(reward.amount);
    });

    // 5. Fetch Qualifiers (All unlocked ranks per user)
    const { data: allRanks, error: ranksError } = await supabase
      .from('user_ranks')
      .select('user_id, rank');
      
    if (ranksError) throw ranksError;

    // 5b. Fetch direct members count per user
    const { data: directsData, error: directsError } = await supabase
      .from('referrals')
      .select('sponsor_id')
      .eq('level', 1);
    if (directsError) throw directsError;
    const userDirectsCount: Record<string, number> = {};
    directsData?.forEach(row => {
      userDirectsCount[row.sponsor_id] = (userDirectsCount[row.sponsor_id] ?? 0) + 1;
    });
    // Existing: map of highest rank per user
    const userHighestRank: Record<string, number> = {};
    allRanks?.forEach(r => {
      if (!userHighestRank[r.user_id] || r.rank > userHighestRank[r.user_id]) {
        userHighestRank[r.user_id] = r.rank;
      }
    });

    // Determine active qualifiers for each rank
    const activeQualifiersByRank: Record<number, string[]> = {
      5: [], 6: [], 7: [], 8: [], 9: [], 10: []
    };

    Object.entries(userHighestRank).forEach(([userId, maxRank]) => {
      // Only include users who have at least 2 direct members
      if ((userDirectsCount[userId] || 0) < 2) return;
      // User participates in ALL ranks from 5 up to their max rank
      for (let r = 5; r <= Math.min(maxRank, 10); r++) {
        const earned = userEarningsByRank[userId]?.[r] || 0;
        const maxCap = RANK_PRICES[r] * 2;
        
        // If they haven't hit the cap, they are an active qualifier
        if (earned < maxCap) {
          activeQualifiersByRank[r].push(userId);
        }
      }
    });

    // 6. Create Distribution Record (We will update admin_profit later)
    const { data: newDist, error: distError } = await supabase
      .from('weekly_distributions')
      .insert({ total_business: totalBusiness, admin_profit: 0 })
      .select('id')
      .single();

    if (distError) throw distError;
    const distributionId = newDist.id;

    // 7. Calculate and Insert Pending Rewards with Capping
    const pendingRewards = [];
    let totalAdminProfit = 0;
    
    for (const [rankStr, percentage] of Object.entries(RANK_PERCENTAGES)) {
      const rank = parseInt(rankStr);
      const qualifiers = activeQualifiersByRank[rank];
      
      if (qualifiers.length > 0) {
        const rankPool = totalBusiness * percentage;
        const baseShare = Number((rankPool / qualifiers.length).toFixed(2));
        
        for (const userId of qualifiers) {
          const earned = userEarningsByRank[userId]?.[rank] || 0;
          const maxCap = RANK_PRICES[rank] * 2;
          const remainingCap = maxCap - earned;
          
          let actualShare = baseShare;
          
          if (actualShare > remainingCap) {
            actualShare = remainingCap; // Cap it
            totalAdminProfit += (baseShare - actualShare); // Admin keeps the difference
          }
          
          if (actualShare > 0) {
            pendingRewards.push({
              user_id: userId,
              distribution_id: distributionId,
              rank: rank,
              amount: Number(actualShare.toFixed(2)),
              status: 'pending'
            });
          }
        }
      } else {
        // If no qualifiers for this rank, the entire rank pool goes to admin profit
        totalAdminProfit += (totalBusiness * percentage);
      }
    }

    if (pendingRewards.length > 0) {
      const { error: insertError } = await supabase
        .from('pending_weekly_rewards')
        .insert(pendingRewards);
      if (insertError) throw insertError;
    }

    // 8. Update Distribution Record with Admin Profit
    if (totalAdminProfit > 0) {
      await supabase
        .from('weekly_distributions')
        .update({ admin_profit: Number(totalAdminProfit.toFixed(2)) })
        .eq('id', distributionId);
    }

    return NextResponse.json({ 
      success: true, 
      totalBusiness,
      rewardsCount: pendingRewards.length,
      adminProfit: totalAdminProfit
    });

  } catch (error: any) {
    console.error('Distribute weekly error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
