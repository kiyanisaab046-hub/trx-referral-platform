'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { NetworkTree, TreeNode } from '../../../components/NetworkTree';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

export default function MyTeamPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // Fetch current user profile
        const { data: currentUserProfile } = await supabase
          .from('users')
          .select('id, full_name')
          .eq('id', authUser.id)
          .single();

        // Fetch all referrals to build the tree
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id');

        if (refsError) throw refsError;

        // Fetch all users for name mapping
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name');

        if (usersError) throw usersError;

        const userMap: Record<string, string> = {};
        usersData?.forEach(u => { userMap[u.id] = u.full_name; });

        // Build the recursive tree — level starts at 1 for direct referrals
        let count = 0;
        const buildTree = (rootId: string, rootName: string, level: number): TreeNode => {
          const node: TreeNode = {
            id: rootId,
            name: rootName || 'User',
            level,
            children: []
          };

          const childrenRefs = allRefs?.filter(r => r.sponsor_id === rootId) || [];
          node.children = childrenRefs.map(childRef => {
            count++;
            return buildTree(
              childRef.referred_id,
              userMap[childRef.referred_id] || 'User',
              level + 1
            );
          });

          return node;
        };

        const rootName = currentUserProfile?.full_name || 'Me';
        const fullTree = buildTree(authUser.id, rootName, 0);

        setTotalCount(count);
        setTreeData(fullTree);
      } catch (err: any) {
        console.error('Error fetching team tree:', err);
        setError(err.message || 'Failed to load team tree');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Count members at each level for the summary
  const getLevelCounts = (node: TreeNode): Record<number, number> => {
    const counts: Record<number, number> = {};
    const traverse = (n: TreeNode) => {
      if (n.level > 0) {
        counts[n.level] = (counts[n.level] || 0) + 1;
      }
      n.children.forEach(traverse);
    };
    traverse(node);
    return counts;
  };

  const levelCounts = treeData ? getLevelCounts(treeData) : {};
  const levelEntries = Object.entries(levelCounts).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>My Team</h2>
            <span className={styles.logoSlogan}>Your Referral Network</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            🔙 Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.mainContent} style={{ flex: 1, padding: '2rem 1rem' }}>
        {/* Level Summary Bar */}
        {!loading && !error && treeData && treeData.children.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00d2ff22, #0080ff22)',
              border: '1px solid rgba(0,210,255,0.2)',
              color: '#00d2ff',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              Total: {totalCount} members
            </div>
            {levelEntries.map(([level, count]) => (
              <div key={level} style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: Number(level) === 1
                  ? 'rgba(46,204,113,0.1)'
                  : 'rgba(243,156,18,0.1)',
                border: `1px solid ${Number(level) === 1 ? 'rgba(46,204,113,0.2)' : 'rgba(243,156,18,0.2)'}`,
                color: Number(level) === 1 ? '#2ecc71' : '#f39c12',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Level {level}: {count} {Number(level) === 1 ? 'Direct' : 'Indirect'}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
            <h2>Error Loading Team</h2>
            <p>{error}</p>
          </div>
        ) : treeData && treeData.children.length > 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', overflowX: 'auto' }}>
            <NetworkTree data={treeData} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2 style={{ color: '#ccc', marginBottom: '0.5rem' }}>No Team Members Yet</h2>
            <p>Share your referral link to start building your team!</p>
          </div>
        )}
      </main>
    </div>
  );
}
