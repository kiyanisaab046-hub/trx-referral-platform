import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';



export async function GET() {
   try {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
     const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
     if (!supabaseUrl || !supabaseKey) {
       throw new Error('Supabase URL or key is missing');
     }
     const supabase = createClient(supabaseUrl, supabaseKey);
     let totalBusiness = 0;
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, description')
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching global transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch global business' }, { status: 500 });
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      data.forEach((tx) => {
        if (
          tx.type === 'deposit' ||
          tx.type === 'rank_purchase' ||
          (tx.type === 'withdrawal' && tx.description && tx.description.includes('Rank Purchase'))
        ) {
          totalBusiness += Math.abs(Number(tx.amount) || 0);
        }
      });

      if (data.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return NextResponse.json({ totalGlobalBusiness: totalBusiness });
  } catch (error: any) {
    console.error('Global business route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
