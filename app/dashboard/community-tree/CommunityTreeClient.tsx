import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NetworkTree, { TreeNode } from '../../components/NetworkTree';
import UserDetailsModal from '../../components/UserDetailsModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import TreeView from '../../components/TreeView';
import styles from '../dashboard.module.css';

// This is a client component handling data fetching, state, and UI interactions.
export default function CommunityTreeClient() {
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  // New: member list for the Tree view
  interface Member { id: string; name: string; parent_id?: string; wallet?: string; }
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNodeClick = (id: string) => {
    setSelectedUserId(id);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }
        // Fetch current user's profile
        const { data: currentUserProfile } = await supabase
          .from('users')
          .select('id, full_name')
          .eq('id', authUser.id)
          .single();
        // Build tree data (placeholder example)
        const rootNode: TreeNode = {
          id: currentUserProfile?.id ?? '',
          name: currentUserProfile?.full_name ?? 'Current User',
          level: 0,
          isDirect: true,
          children: [],
        };
        // Fetch all members for the Tree view
        const { data: memberRows, error: memberError } = await supabase
          .from('referrals')
          .select('id, name, parent_id, wallet');
        if (memberError) console.error('Member fetch error', memberError);
        else setMembers(memberRows as any);
        setTreeData(rootNode);
        setTreeData(rootNode);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to load tree');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

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
          <button onClick={() => router.push('/')} className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {treeData && <NetworkTree data={treeData} onNodeClick={handleNodeClick} />}
        {members.length > 0 && <TreeView members={members} />}
      {modalOpen && selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
