'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

interface TeamMember {
  id: string;
  name: string;
  sponsorId: string;
  activationDate?: string;
  currentLevel: number;
  directTeam: number;
}

export default function MyTeamPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelData, setLevelData] = useState<Record<number, TeamMember[]>>({});
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // 1. Fetch all referrals
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id');

        if (refsError) throw refsError;

        // 2. Map direct counts (for "Direct Team" column)
        const directCounts: Record<string, number> = {};
        allRefs?.forEach(ref => {
          directCounts[ref.sponsor_id] = (directCounts[ref.sponsor_id] || 0) + 1;
        });

        // 3. Get my downline IDs using BFS
        const allRefsSafe = allRefs || [];
        const visited = new Set<string>();
        const myDownlineRefs: any[] = [];
        const stack = [authUser.id];
        
        while (stack.length) {
          const cur = stack.pop()!;
          const children = allRefsSafe.filter(r => r.sponsor_id === cur);
          children.forEach(r => {
            if (!visited.has(r.referred_id)) {
              visited.add(r.referred_id);
              stack.push(r.referred_id);
              myDownlineRefs.push(r);
            }
          });
        }

        if (myDownlineRefs.length === 0) {
          setLoading(false);
          return; // No downline
        }

        const downlineIds = myDownlineRefs.map(r => r.referred_id);

        // 4. Fetch User details for downline
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', downlineIds);
          
        if (usersError) throw usersError;

        const userMap: Record<string, string> = {};
        usersData?.forEach(u => { userMap[u.id] = u.full_name; });

        // 5. Fetch user ranks for Activation Date and Current Level
        const { data: ranksData, error: ranksError } = await supabase
          .from('user_ranks')
          .select('user_id, rank, created_at')
          .in('user_id', downlineIds);

        if (ranksError) throw ranksError;

        // Map max rank and earliest activation date
        const userRankInfo: Record<string, { maxRank: number, earliestDate: string | null }> = {};
        ranksData?.forEach(r => {
          if (!userRankInfo[r.user_id]) {
            userRankInfo[r.user_id] = { maxRank: r.rank, earliestDate: r.created_at };
          } else {
            if (r.rank > userRankInfo[r.user_id].maxRank) userRankInfo[r.user_id].maxRank = r.rank;
            if (new Date(r.created_at) < new Date(userRankInfo[r.user_id].earliestDate!)) {
              userRankInfo[r.user_id].earliestDate = r.created_at;
            }
          }
        });

        // 6. Build the binary tree level mapping
        const directs = myDownlineRefs
          .filter(r => r.sponsor_id === authUser.id)
          .map(r => r.referred_id);
          
        const indirects = myDownlineRefs
          .filter(r => r.sponsor_id !== authUser.id)
          .map(r => r.referred_id);

        const pool = [...directs, ...indirects]; // Pool of user IDs
        
        let poolIndex = 0;
        let currentLevelQueue = [authUser.id];
        let level = 1;
        const resultLevels: Record<number, TeamMember[]> = {};

        // We only go up to Level 10
        while (poolIndex < pool.length && level <= 10) {
          const maxCapacity = Math.pow(2, level);
          const nextLevelQueue: string[] = [];
          resultLevels[level] = [];

          // For each node in the previous level, we give them up to 2 children from the pool
          for (let i = 0; i < currentLevelQueue.length; i++) {
            for (let branch = 0; branch < 2; branch++) {
              if (poolIndex < pool.length) {
                const newUserId = pool[poolIndex];
                
                // Find sponsor info
                const refObj = myDownlineRefs.find(r => r.referred_id === newUserId);
                
                resultLevels[level].push({
                  id: newUserId,
                  name: userMap[newUserId] || 'Unknown',
                  sponsorId: refObj?.sponsor_id || '-',
                  activationDate: userRankInfo[newUserId]?.earliestDate || undefined,
                  currentLevel: userRankInfo[newUserId]?.maxRank || 0,
                  directTeam: directCounts[newUserId] || 0
                });

                nextLevelQueue.push(newUserId);
                poolIndex++;
              }
            }
          }

          currentLevelQueue = nextLevelQueue;
          level++;
        }

        setLevelData(resultLevels);

      } catch (err: any) {
        console.error('Error building team tree:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  const shortenId = (id: string) => {
    if (!id || id === '-') return '-';
    return id.slice(0, 8) + '...' + id.slice(-4);
  };

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>My Team</h2>
            <span className={styles.logoSlogan}>Binary Tree Network</span>
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
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(10,15,30,0.6)', borderRadius: '12px', border: '1px solid rgba(0,210,255,0.15)', overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
            
            {/* Horizontal Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setActiveTab(lvl)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: activeTab === lvl ? 'linear-gradient(135deg, #00d2ff, #0080ff)' : 'transparent',
                    color: activeTab === lvl ? '#fff' : '#8892b0',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                    minWidth: '60px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff', fontWeight: 'bold' }}>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>S.No</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>User ID</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Sponsor ID</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Activation Date</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Current Level</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Direct Team</th>
                  </tr>
                </thead>
                <tbody>
                  {(levelData[activeTab] || []).length > 0 ? (
                    levelData[activeTab].map((member, index) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem' }}>{index + 1}</td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace' }} title={member.id}>{shortenId(member.id)}</td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace' }} title={member.sponsorId}>{shortenId(member.sponsorId)}</td>
                        <td style={{ padding: '1rem' }}>
                          {member.activationDate 
                            ? new Date(member.activationDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td style={{ padding: '1rem', color: '#00d2ff', fontWeight: 'bold' }}>{member.currentLevel}</td>
                        <td style={{ padding: '1rem', color: '#2ecc71', fontWeight: 'bold' }}>{member.directTeam}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#8892b0' }}>
                        No members found at Level {activeTab}. Maximum capacity is {Math.pow(2, activeTab)}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', textAlign: 'right', fontSize: '0.8rem', color: '#8892b0', borderTop: '1px solid rgba(0,210,255,0.1)' }}>
              Level {activeTab} Capacity: {(levelData[activeTab] || []).length} / {Math.pow(2, activeTab)} members
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
