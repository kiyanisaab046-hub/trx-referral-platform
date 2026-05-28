'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { NetworkTree, TreeNode } from '../../../components/NetworkTree';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css'; // Reuse dashboard styles for layout consistency

export default function CommunityTreePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
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

        // Fetch all referrals
        // NOTE: If RLS is strictly enforced on 'referrals', this will only return rows 
        // the user is allowed to see. If you want the full downline, make sure the Supabase 
        // SQL policies are updated properly (see implementation plan).
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id');

        if (refsError) throw refsError;

        // Fetch all users to map names
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name');
          
        if (usersError) throw usersError;

        const userMap: Record<string, string> = {};
        usersData?.forEach(u => { userMap[u.id] = u.full_name; });

        // Build a map of all users (including current user) to TreeNode objects
        const nodeMap: Record<string, TreeNode> = {};

        // Root node (current user)
        const rootNode: TreeNode = {
          id: authUser.id,
          name: currentUserProfile?.full_name || 'Me',
          level: 0,
          isDirect: false,
          children: []
        };
        nodeMap[authUser.id] = rootNode;

        const allRefsSafe = allRefs || [];

        // Ensure a node exists for every referred user and sponsor
        allRefsSafe.forEach(ref => {
          if (!nodeMap[ref.referred_id]) {
            nodeMap[ref.referred_id] = {
              id: ref.referred_id,
              name: userMap[ref.referred_id] || 'User',
              level: 0,
              isDirect: false,
              children: []
            };
          }
          if (!nodeMap[ref.sponsor_id]) {
            nodeMap[ref.sponsor_id] = {
              id: ref.sponsor_id,
              name: userMap[ref.sponsor_id] || 'User',
              level: 0,
              isDirect: false,
              children: []
            };
          }
        });

        // Attach children based on referral relationships
        allRefsSafe.forEach(ref => {
          const sponsorNode = nodeMap[ref.sponsor_id];
          const childNode = nodeMap[ref.referred_id];
          // Mark direct referrals (children of the current user)
          childNode.isDirect = ref.sponsor_id === authUser.id;
          sponsorNode.children.push(childNode);
        });

        // Recursively compute depth levels for rendering
        const computeLevels = (node: TreeNode, depth: number) => {
          node.level = depth;
          node.children.forEach(child => computeLevels(child, depth + 1));
        };
        computeLevels(rootNode, 0);

        setTreeData(rootNode);
      } catch (err: any) {
        console.error('Error fetching tree:', err);
        setError(err.message || 'Failed to load community tree');
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
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Community Tree</h2>
            <span className={styles.logoSlogan}>Visual Downline Network</span>
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
            <h2>Error Loading Tree</h2>
            <p>{error}</p>
          </div>
        ) : treeData && treeData.children.length > 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', overflowX: 'auto' }}>
            <NetworkTree data={treeData} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Community Members Yet</h2>
            <p>Share your referral link to start building your network!</p>
          </div>
        )}
      </main>
    </div>
  );
}
