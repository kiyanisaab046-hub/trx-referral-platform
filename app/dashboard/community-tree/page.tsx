'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import NetworkTree, { TreeNode } from '../../components/NetworkTree';
import UserDetailsModal from '../../components/UserDetailsModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

export default function CommunityTreePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const handleNodeClick = (id: string) => {
    setSelectedUserId(id);
    setModalOpen(true);
  };
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [levelStats, setLevelStats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch all users with binary pointers
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, left_child_id, right_child_id');
          
        if (usersError) throw usersError;

        // Fetch direct referrals to mark isDirect
        const { data: directRefs } = await supabase
          .from('referrals')
          .select('referred_id')
          .eq('sponsor_id', authUser.id);
        const directSet = new Set<string>();
        directRefs?.forEach(r => directSet.add(r.referred_id));

        const userMap: Record<string, any> = {};
        usersData?.forEach(u => { userMap[u.id] = u; });

        // Build a physical matrix tree
        const buildTree = (nodeId: string, depth: number): TreeNode | null => {
          const u = userMap[nodeId];
          if (!u) return null;
          if (depth > 10) return null; // limit depth for UI
          
          const node: TreeNode = {
            id: u.id,
            name: u.full_name || 'User',
            level: depth,
            isDirect: directSet.has(u.id),
            children: []
          };

          if (u.left_child_id) {
            const leftChild = buildTree(u.left_child_id, depth + 1);
            if (leftChild) node.children.push(leftChild);
          }
          if (u.right_child_id) {
            const rightChild = buildTree(u.right_child_id, depth + 1);
            if (rightChild) node.children.push(rightChild);
          }

          return node;
        };

        const rootNode = buildTree(authUser.id, 0);

        setTreeData(rootNode);

        // Compute per‑level stats
        const statsArray = Array.from({ length: 10 }, () => ({ people: 0, cumulative: 0 }));
        if (rootNode) {
            const traverse = (node: TreeNode, depth: number) => {
            if (depth >= 10) return;
            statsArray[depth].people += 1;
            statsArray[depth].cumulative = statsArray.slice(0, depth + 1).reduce((sum, s) => sum + s.people, 0);
            node.children.forEach(child => traverse(child, depth + 1));
            };
            traverse(rootNode, 0);
        }
        setLevelStats(statsArray);
      } catch (err: any) {
        console.error('Error fetching tree:', err);
        setError(err.message || 'Failed to load community network');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Community Tree</h2>
            <span className={styles.logoSlogan}>Physical Matrix Downline</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            🔙 Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.mainContent} style={{ flex: 1, padding: '2rem 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
            <h2>Error Loading Downline</h2>
            <p>{error}</p>
          </div>
        ) : treeData && treeData.children.length > 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', overflowX: 'auto' }}>
            <NetworkTree data={treeData} onNodeClick={handleNodeClick} maxLevel={10} />
          {/* Mobile‑only analytic cards */}
          <div className="mt-4 block md:hidden">
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="text-white mb-2">MATRIX COMMUNITY TREE</h3>
                <table className="w-full text-sm text-left text-gray-300">
                  <thead>
                    <tr>
                      <th className="pr-2">Level</th>
                      <th className="pr-2">People</th>
                      <th className="pr-2">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelStats.map((s, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="pr-2">{i + 1}</td>
                        <td className="pr-2">{s.people}</td>
                        <td className="pr-2">{s.cumulative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Community Members Yet</h2>
            <p>Share your referral link to start building your community network!</p>
          </div>
        )}
        {modalOpen && selectedUserId && (
          <UserDetailsModal userId={selectedUserId} onClose={() => setModalOpen(false)} />
        )}
      </main>
    </div>
  );
}
