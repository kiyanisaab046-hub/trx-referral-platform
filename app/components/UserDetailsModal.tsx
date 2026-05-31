import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type UserDetails = {
  id: string;
  wallet_address: string;
  sponsor_id: string | null;
  activation_date: string | null;
  rank: string | null;
  directCount: number;
  communitySize: number;
};

type Props = {
  userId: string;
  onClose: () => void;
};

export const UserDetailsModal: React.FC<Props> = ({ userId, onClose }) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to compute community size via BFS
  const computeCommunitySize = async (rootId: string) => {
    const { data: allRefs, error: refsError } = await supabase
      .from('referrals')
      .select('sponsor_id, referred_id');
    if (refsError) throw refsError;
    const visited = new Set<string>();
    const stack = [rootId];
    while (stack.length) {
      const cur = stack.pop()!;
      const children = allRefs?.filter((r: any) => r.sponsor_id === cur) || [];
      for (const child of children) {
        if (!visited.has(child.referred_id)) {
          visited.add(child.referred_id);
          stack.push(child.referred_id);
        }
      }
    }
    return visited.size;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Basic user info
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('id, sponsor_id, created_at')
          .eq('id', userId)
          .single();
        if (userErr) throw userErr;

        // Wallet address (assume column wallet_address in wallets table)
        const { data: wallet, error: walletErr } = await supabase
          .from('wallets')
          .select('wallet_address')
          .eq('user_id', userId)
          .single();
        if (walletErr) throw walletErr;

        // Direct team count
        const { count: directCount, error: directErr } = await supabase
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', userId);
        if (directErr) throw directErr;

        // Community size (direct + indirect)
        const communitySize = await computeCommunitySize(userId);

        // Rank (latest entry in user_ranks)
        const { data: rankData, error: rankErr } = await supabase
          .from('user_ranks')
          .select('rank')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        const rank = rankErr ? null : rankData?.rank ?? null;

        setDetails({
          id: user.id,
          wallet_address: wallet?.wallet_address ?? '',
          sponsor_id: user.sponsor_id,
          activation_date: user.created_at,
          rank,
          directCount: directCount || 0,
          communitySize,
        });
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gray-900 text-red-400 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-900 text-white rounded-xl p-6 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">User Details</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">ID:</span> {details?.id}</p>
          <p><span className="font-semibold">Wallet:</span> {details?.wallet_address}</p>
          <p><span className="font-semibold">Referrer:</span> {details?.sponsor_id ?? '—'}</p>
          <p><span className="font-semibold">Community:</span> {details?.communitySize}</p>
          <p><span className="font-semibold">Direct Team:</span> {details?.directCount}</p>
          <p><span className="font-semibold">Activation:</span> {details?.activation_date?.split('T')[0] ?? '—'}</p>
          <p><span className="font-semibold">Rank:</span> {details?.rank ?? '—'}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};
