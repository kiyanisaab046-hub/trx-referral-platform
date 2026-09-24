import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client will be initialized inside GET handler to avoid missing env vars at build time

const RANK_PRICES: Record<number, number> = {
  5: 48,
  6: 96,
  7: 192,
  8: 384,
  9: 768,
  10: 1536,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rankIdStr = searchParams.get('rank');
    if (!rankIdStr) {
      return NextResponse.json({ error: 'Rank parameter is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or key is missing');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetRank = parseInt(rankIdStr, 10);

    // 1. Fetch All Previous Earnings for this specific rank to calculate caps
    const { data: allRewards, error: rewardsError } = await supabase
      .from('pending_weekly_rewards')
      .select('user_id, amount')
      .eq('rank', targetRank);

    if (rewardsError) throw rewardsError;

    const userEarnings: Record<string, number> = {};
    allRewards?.forEach((reward) => {
      userEarnings[reward.user_id] = (userEarnings[reward.user_id] || 0) + Number(reward.amount);
    });

    // 2. Fetch all ranks to determine highest rank per user
    // We also need the specific achievement date for the targetRank
    const { data: allRanks, error: ranksError } = await supabase
      .from('user_ranks')
      .select('user_id, rank, created_at');

    if (ranksError) throw ranksError;

    const userHighestRank: Record<string, number> = {};
    const userAchievementDate: Record<string, string> = {};

    allRanks?.forEach((r) => {
      // Track highest rank
      if (!userHighestRank[r.user_id] || r.rank > userHighestRank[r.user_id]) {
        userHighestRank[r.user_id] = r.rank;
      }
      // Track when they specifically hit the target rank
      if (r.rank === targetRank) {
        userAchievementDate[r.user_id] = r.created_at;
      }
    });

    // 3. Fetch direct members count per user
    const { data: directsData, error: directsError } = await supabase
      .from('referrals')
      .select('sponsor_id')
      .eq('level', 1);

    if (directsError) throw directsError;

    const userDirectsCount: Record<string, number> = {};
    directsData?.forEach((row) => {
      userDirectsCount[row.sponsor_id] = (userDirectsCount[row.sponsor_id] || 0) + 1;
    });

    // 4. Dynamic Multi-Rank Qualification Filter
    const activeQualifierIds: string[] = [];
    const maxCap = (RANK_PRICES[targetRank] || 0) * 2;

    Object.entries(userHighestRank).forEach(([userId, maxRank]) => {
      // Must have unlocked the rank (either currently at it, or passed it)
      if (maxRank < targetRank) return;
      // Must have at least 2 directs
      if ((userDirectsCount[userId] || 0) < 2) return;
      
      // Must not have exhausted the pool cap for this rank
      const earned = userEarnings[userId] || 0;
      if (earned < maxCap) {
        activeQualifierIds.push(userId);
      }
    });

    if (activeQualifierIds.length === 0) {
      return NextResponse.json({ achievers: [] });
    }

    // 5. Fetch user details for the active qualifiers
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, numeric_id')
      .in('id', activeQualifierIds);

    if (usersError) throw usersError;

    // 6. Combine and format data
    const achievers = usersData.map((u) => {
      return {
        id: u.id,
        numericId: u.numeric_id || u.id.substring(0, 8),
        name: u.full_name || 'Anonymous',
        achievedAt: userAchievementDate[u.id] || null,
      };
    });

    // Sort by achieved date
    achievers.sort((a, b) => {
      if (!a.achievedAt || !b.achievedAt) return 0;
      return new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime();
    });

    return NextResponse.json({ achievers });
  } catch (error: any) {
    console.error('Global achievers route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
