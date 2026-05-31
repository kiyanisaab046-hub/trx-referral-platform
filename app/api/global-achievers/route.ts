import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client will be initialized inside GET handler to avoid missing env vars at build time

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rankIdStr = searchParams.get('rank');
    if (!rankIdStr) {
      return NextResponse.json({ error: 'Rank parameter is required' }, { status: 400 });
    }

    const rankId = parseInt(rankIdStr, 10);

    // Fetch user_ranks
    const { data: ranksData, error: ranksError } = await supabase
      .from('user_ranks')
      .select('user_id, created_at')
      .eq('rank', rankId);

    if (ranksError) {
      console.error('Error fetching ranks:', ranksError);
      return NextResponse.json({ error: 'Failed to fetch ranks' }, { status: 500 });
    }

    if (!ranksData || ranksData.length === 0) {
      return NextResponse.json({ achievers: [] });
    }

    const userIds = ranksData.map((r) => r.user_id);

    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, numeric_id')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Combine data
    const achievers = usersData.map((u) => {
      const rankInfo = ranksData.find((r) => r.user_id === u.id);
      return {
        id: u.id,
        numericId: u.numeric_id || u.id.substring(0, 8),
        name: u.full_name || 'Anonymous',
        achievedAt: rankInfo ? rankInfo.created_at : null,
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
