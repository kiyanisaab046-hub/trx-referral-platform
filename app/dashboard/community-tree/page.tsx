'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { LevelIncome, LevelGroup } from '../../../components/LevelIncome';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

export default function CommunityTreePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<LevelGroup[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // Fetch all referrals (RLS ensures we only get our downline if policy is configured correctly)
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id, joined_at');

        if (refsError) throw refsError;

        if (!allRefs || allRefs.length === 0) {
          setLevels([]);
          setTotalMembers(0);
          setLoading(false);
          return;
        }

        // Extract all unique user IDs from the referral relationships
        const userIds = new Set<string>();
        allRefs.forEach(ref => {
          userIds.add(ref.sponsor_id);
          userIds.add(ref.referred_id);
        });

        // Fetch user profiles for names
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', Array.from(userIds));
          
        if (usersError) throw usersError;

        const userMap: Record<string, string> = {};
        usersData?.forEach(u => { userMap[u.id] = u.full_name; });

        // Build Adjacency List for downward traversal: sponsor_id -> [referred_id, ...]
        const downlineMap: Record<string, any[]> = {};
        allRefs.forEach(ref => {
          if (!downlineMap[ref.sponsor_id]) {
            downlineMap[ref.sponsor_id] = [];
          }
          downlineMap[ref.sponsor_id].push({
            id: ref.referred_id,
            joinedAt: ref.joined_at
          });
        });

        // BFS or Level-order traversal to group by levels
        const calculatedLevels: LevelGroup[] = [];
        let currentLevelNodes = downlineMap[authUser.id] || [];
        let currentLevelNum = 1;
        let totalCount = 0;

        while (currentLevelNodes.length > 0) {
          const nextLevelNodes: any[] = [];
          const membersInThisLevel = [];

          for (const node of currentLevelNodes) {
            membersInThisLevel.push({
              id: node.id,
              name: userMap[node.id] || 'Unknown User',
              joinedAt: node.joinedAt
            });
            totalCount++;

            // Gather children of this node for the next level
            if (downlineMap[node.id]) {
              nextLevelNodes.push(...downlineMap[node.id]);
            }
          }

          calculatedLevels.push({
            level: currentLevelNum,
            members: membersInThisLevel
          });

          currentLevelNodes = nextLevelNodes;
          currentLevelNum++;
        }

        setLevels(calculatedLevels);
        setTotalMembers(totalCount);
      } catch (err: any) {
        console.error('Error fetching downline:', err);
        setError(err.message || 'Failed to load community data');
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
            <h2 className={styles.logoText}>Team Income</h2>
            <span className={styles.logoSlogan}>Level-wise Downline</span>
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
        ) : levels.length > 0 ? (
          <LevelIncome levels={levels} totalMembers={totalMembers} />
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Team Members Yet</h2>
            <p>Share your referral link to start building your level income network!</p>
          </div>
        )}
      </main>
    </div>
  );
}
