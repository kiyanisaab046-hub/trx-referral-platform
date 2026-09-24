import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase URL or key is missing');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all user ranks for ranks 5-10
    const { data: ranksData, error: ranksError } = await supabase
      .from('user_ranks')
      .select('user_id, rank, created_at')
      .in('rank', [5, 6, 7, 8, 9, 10]);
    if (ranksError) throw ranksError;
    if (!ranksData || ranksData.length === 0) {
      return NextResponse.json({ data: {} });
    }
    // Gather unique user IDs
    const userIds = [...new Set(ranksData.map((r) => r.user_id))];
    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, numeric_id')
      .in('id', userIds);
    if (usersError) throw usersError;
    // Map user info
    const userMap: Record<string, { name: string; numericId: string }> = {};
    usersData?.forEach((u) => {
      userMap[u.id] = {
        name: u.full_name || 'Anonymous',
        numericId: u.numeric_id || u.id.substring(0, 8),
      };
    });
    // Group by rank
    const grouped: Record<number, any[]> = {};
    ranksData.forEach((r) => {
      const info = userMap[r.user_id];
      if (!info) return;
      if (!grouped[r.rank]) grouped[r.rank] = [];
      grouped[r.rank].push({
        id: r.user_id,
        name: info.name,
        numericId: info.numericId,
        achievedAt: r.created_at,
      });
    });
    // Sort each rank by achieved date
    Object.values(grouped).forEach((arr: any[]) => {
      arr.sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime());
    });
    return NextResponse.json({ data: grouped });
  } catch (error: any) {
    console.error('Archiver route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
