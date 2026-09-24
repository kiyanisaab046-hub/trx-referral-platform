// lib/useSupabaseQuery.ts
import useSWR from 'swr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { supabase } from "./supabase";

// Initialize anon client (public anon key should be stored in env)
const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/**
 * Flexible Supabase query hook with optional role selection.
 *
 * @param table   Name of the table to query.
 * @param options { role?: 'anon' | 'authenticated'; limit?: number; offset?: number; select?: string }
 * @param args    Additional arguments passed to the fetcher (e.g., filter object).
 */
export function useSupabaseQuery<T>(
  table: string,
  options?: { role?: 'anon' | 'authenticated'; limit?: number; offset?: number; select?: string },
  args?: Record<string, unknown[]>
) {
  const { role = 'anon', limit, offset, select } = options || {};

  // Choose client based on role
  const client = role === 'authenticated'
    ? supabase
    : anonSupabase;

  const fetcher = async () => {
    let query = client.from(table).select(select ?? '*');
    if (typeof limit === 'number' && typeof offset === 'number') {
      query = query.range(offset, offset + limit - 1);
    } else if (typeof limit === 'number') {
      query = query.limit(limit);
    } else if (typeof offset === 'number') {
      query = query.range(offset, offset + 9999);
    }
    // Merge any extra filter arguments (e.g., .eq, .in)
    if (args) {
      Object.entries(args).forEach(([method, params]) => {
         
        if (typeof (query as any)[method] === 'function') {
          query = (query as any)[method](...params);
        }
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  };

  const { data, error, isValidating, mutate } = useSWR<T[]>(
    // The key includes all parameters to make it unique per query
    [table, role, limit, offset, select, JSON.stringify(args)],
    fetcher,
    { revalidateOnFocus: false }
  );

  return { data, error, isLoading: isValidating, mutate };
}
