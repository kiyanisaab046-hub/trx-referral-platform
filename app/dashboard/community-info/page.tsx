'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { MemberModal } from '../../../components/MemberModal';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

interface CommunityMember {
  id: string;
  name: string;
  level: number; // 1 = direct, 2+ = indirect
  joinedAt?: string;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function CommunityInfoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // Fetch all referrals
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id, joined_at');

        if (refsError) throw refsError;
        if (!allRefs || allRefs.length === 0) {
          setMembers([]);
          setLoading(false);
          return;
        }

        // Get all user IDs
        const userIds = new Set<string>();
        allRefs.forEach(ref => {
          userIds.add(ref.referred_id);
          userIds.add(ref.sponsor_id);
        });

        // Fetch user names
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        const userMap: Record<string, string> = {};
        usersData?.forEach(u => { userMap[u.id] = u.full_name; });

        // Build downline map
        const downlineMap: Record<string, { id: string; joinedAt?: string }[]> = {};
        allRefs.forEach(ref => {
          if (!downlineMap[ref.sponsor_id]) {
            downlineMap[ref.sponsor_id] = [];
          }
          downlineMap[ref.sponsor_id].push({
            id: ref.referred_id,
            joinedAt: ref.joined_at,
          });
        });

        // BFS to get all members with their levels
        const allMembers: CommunityMember[] = [];
        let currentLevelNodes = downlineMap[authUser.id] || [];
        let currentLevel = 1;

        while (currentLevelNodes.length > 0) {
          const nextLevelNodes: { id: string; joinedAt?: string }[] = [];
          for (const node of currentLevelNodes) {
            allMembers.push({
              id: node.id,
              name: userMap[node.id] || 'Unknown User',
              level: currentLevel,
              joinedAt: node.joinedAt,
            });
            if (downlineMap[node.id]) {
              nextLevelNodes.push(...downlineMap[node.id]);
            }
          }
          currentLevelNodes = nextLevelNodes;
          currentLevel++;
        }

        setMembers(allMembers);
      } catch (err: any) {
        console.error('Error fetching community:', err);
        setError(err.message || 'Failed to load community info');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [router, supabase]);

  const filteredMembers = members.filter(m => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'direct' && m.level === 1) ||
      (filter === 'indirect' && m.level > 1);
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const directCount = members.filter(m => m.level === 1).length;
  const indirectCount = members.filter(m => m.level > 1).length;

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Community Info</h2>
            <span className={styles.logoSlogan}>All Members Overview</span>
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
          <>
            {/* Summary Bar */}
            <div style={{
              display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
            }}>
              <div style={{
                flex: 1, minWidth: '140px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00d2ff' }}>{members.length}</div>
                <div style={{ fontSize: '0.8rem', color: '#8892b0', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Total Members</div>
              </div>
              <div style={{
                flex: 1, minWidth: '140px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(46,204,113,0.15)',
                borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2ecc71' }}>{directCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#8892b0', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Direct</div>
              </div>
              <div style={{
                flex: 1, minWidth: '140px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(243,156,18,0.15)',
                borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f39c12' }}>{indirectCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#8892b0', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Indirect</div>
              </div>
            </div>

            {/* Search & Filter */}
            <div style={{
              display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
            }}>
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, minWidth: '200px', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['all', 'direct', 'indirect'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize',
                      letterSpacing: '0.03em', transition: 'all 0.2s',
                      background: filter === f ? 'linear-gradient(135deg, #00d2ff, #0080ff)' : 'rgba(255,255,255,0.05)',
                      color: filter === f ? '#fff' : '#8892b0',
                      boxShadow: filter === f ? '0 4px 15px rgba(0,210,255,0.3)' : 'none',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Grid */}
            {filteredMembers.length > 0 ? (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {filteredMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember({ id: member.id, name: member.name })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: member.level === 1
                        ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
                        : 'linear-gradient(135deg, #f39c12, #e67e22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#fff', fontSize: '1rem',
                      boxShadow: member.level === 1
                        ? '0 3px 12px rgba(46,204,113,0.3)'
                        : '0 3px 12px rgba(243,156,18,0.3)',
                    }}>
                      {getInitials(member.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {member.name}
                      </p>
                      {member.joinedAt && (
                        <span style={{ fontSize: '0.72rem', color: '#8892b0' }}>
                          {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <span style={{
                      position: 'absolute', top: '0.4rem', right: '0.5rem',
                      fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                      background: member.level === 1 ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)',
                      color: member.level === 1 ? '#2ecc71' : '#f39c12',
                      border: `1px solid ${member.level === 1 ? 'rgba(46,204,113,0.3)' : 'rgba(243,156,18,0.3)'}`,
                    }}>
                      L{member.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                <h2>No Members Found</h2>
                <p>{searchQuery ? 'Try a different search term.' : 'Share your referral link to start building your community!'}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberModal
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
