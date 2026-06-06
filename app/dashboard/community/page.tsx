'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

interface CommunityMember {
  id: string;
  name: string;
  sponsorId: string;
  activationDate?: string;
  currentLevel: number;
  directTeam: number;
  rank: number;
  spilloverCount: number;
}

export default function CommunityPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelData, setLevelData] = useState<Record<number, (CommunityMember | null)[]>>({});
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // 1. Fetch all referrals to map direct counts
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id, joined_at');

        if (refsError) throw refsError;

        const allRefsSafe = allRefs || [];

        // 2. Fetch all users to resolve physical binary structure
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, numeric_id, sponsor_id, left_child_id, right_child_id, activation_date');

        if (usersError) throw usersError;

        const userMap = new Map<string, any>();
        usersData?.forEach(u => {
          userMap.set(u.id, u);
        });

        // 3. Build matrixMap by recursively traversing physical left_child_id and right_child_id pointers starting from authUser.id
        const matrixMap = new Map<number, { id: string; sponsor_id: string; full_name: string; numeric_id: string; activation_date?: string }>();
        const queue: { id: string; index: number }[] = [];
        
        if (userMap.has(authUser.id)) {
          queue.push({ id: authUser.id, index: 0 });
        }

        while (queue.length > 0) {
          const { id, index } = queue.shift()!;
          const u = userMap.get(id);
          if (!u) continue;

          // Store in matrixMap
          matrixMap.set(index, {
            id: u.id,
            sponsor_id: u.sponsor_id || '',
            full_name: u.full_name || 'Member',
            numeric_id: u.numeric_id || '',
            activation_date: u.activation_date
          });

          const level = Math.floor(Math.log2(index + 1));
          if (level < 10) {
            if (u.left_child_id) {
              queue.push({ id: u.left_child_id, index: 2 * index + 1 });
            }
            if (u.right_child_id) {
              queue.push({ id: u.right_child_id, index: 2 * index + 2 });
            }
          }
        }

        // Collect IDs of people in the matrix (excluding the logged-in user at index 0)
        const matrixIds = Array.from(matrixMap.values()).map(m => m.id).filter(id => id !== authUser.id);
        
        if (matrixIds.length === 0) {
          const emptyLevels: Record<number, (CommunityMember | null)[]> = {};
          for (let i = 1; i <= 10; i++) emptyLevels[i] = new Array(Math.pow(2, i)).fill(null);
          setLevelData(emptyLevels);
          setLoading(false);
          return;
        }

        // 4. Map direct counts (direct referrals)
        const directCounts: Record<string, number> = {};
        const childrenMap: Record<string, string[]> = {};
        allRefsSafe.forEach(ref => {
          // Direct counts
          directCounts[ref.sponsor_id] = (directCounts[ref.sponsor_id] || 0) + 1;
          // Build children map for spillover calculations
          if (!childrenMap[ref.sponsor_id]) {
            childrenMap[ref.sponsor_id] = [];
          }
          childrenMap[ref.sponsor_id].push(ref.referred_id);
        });

        // 5. Fetch user ranks
        const { data: ranksData, error: ranksError } = await supabase
          .from('user_ranks')
          .select('user_id, rank, created_at')
          .in('user_id', matrixIds);

        if (ranksError) throw ranksError;

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

        // 6. Build the level data exactly showing filled and empty slots
        // Compute total descendants for spillover calculation
        const totalDescendantsMap: Record<string, number> = {};
        const countDescendants = (id: string): number => {
          const children = childrenMap[id] || [];
          let total = children.length;
          for (const child of children) {
            total += countDescendants(child);
          }
          return total;
        };
        Object.keys(childrenMap).forEach(id => {
          totalDescendantsMap[id] = countDescendants(id);
        });
        const resultLevels: Record<number, (CommunityMember | null)[]> = {};
        for (let i = 1; i <= 10; i++) {
          const startIdx = Math.pow(2, i) - 1;
          const count = Math.pow(2, i);
          const arr = new Array(count).fill(null);
          
          for (let j = 0; j < count; j++) {
            const idx = startIdx + j;
            if (matrixMap.has(idx)) {
              const node = matrixMap.get(idx)!;
              arr[j] = {
                id: node.id,
                name: node.full_name || 'Unknown User',
                sponsorId: node.sponsor_id,
                activationDate: node.activation_date || userRankInfo[node.id]?.earliestDate || undefined,
                currentLevel: i,
                directTeam: directCounts[node.id] || 0,
                rank: userRankInfo[node.id]?.maxRank || 0,
                spilloverCount: (totalDescendantsMap[node.id] || 0) - (directCounts[node.id] || 0)
              };
            }
          }
          resultLevels[i] = arr;
        }

        setLevelData(resultLevels);

      } catch (err: any) {
        console.error('Error building community tree:', err);
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

  const currentLevelData = levelData[activeTab] || [];

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Community</h2>
            <span className={styles.logoSlogan}>Leg-wise Downline</span>
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
          <div style={{ background: 'rgba(10,15,30,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            
            {/* Horizontal Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', background: '#1c2237', borderBottom: '2px solid #000', WebkitOverflowScrolling: 'touch' }}>
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
                  Level {lvl}
                </button>
              ))}
            </div>

            {/* User List for Active Level */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {currentLevelData.map((member, index) => {
                  if (member) {
                    return (
                      <div key={member.id} style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff' }}>{index + 1}. {member.name}</span>
                          <span style={{ fontSize: '0.8rem', color: '#00d2ff', fontWeight: 'bold' }}>
                            {member.rank === 0 ? 'UNRANKED' :
                             member.rank === 1 ? 'STARTER' :
                             member.rank === 2 ? 'BUILDER' :
                             member.rank === 3 ? 'GROWER' :
                             member.rank === 4 ? 'ACHIEVER' :
                             member.rank === 5 ? 'ADVANCER' :
                             member.rank === 6 ? 'PROGRESSOR' :
                             member.rank === 7 ? 'LEADER' :
                             member.rank === 8 ? 'PIONEER' :
                             member.rank === 9 ? 'CHAMPION' :
                             member.rank === 10 ? 'LEGEND' : `RANK ${member.rank}`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span><strong style={{color:'#8892b0'}}>ID:</strong> {shortenId(member.id)}</span>
                          <span><strong style={{color:'#8892b0'}}>Sponsor:</strong> {shortenId(member.sponsorId)}</span>
                          <span><strong style={{color:'#8892b0'}}>Directs:</strong> <span style={{color:'#2ecc71'}}>{member.directTeam}</span></span>
                          <span><strong style={{color:'#8892b0'}}>Spillover:</strong> <span style={{color:'#ff7f50'}}>{member.spilloverCount}</span></span>
                          <span><strong style={{color:'#8892b0'}}>Joined:</strong> {member.activationDate ? new Date(member.activationDate).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={`empty-${index}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, minHeight: '100px' }}>
                        <span style={{ color: '#8892b0', fontSize: '0.9rem' }}>{index + 1}. Empty Slot</span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center', fontSize: '0.85rem', color: '#8892b0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              Level {activeTab} Capacity: {currentLevelData.filter(Boolean).length} / {Math.pow(2, activeTab)} members
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
