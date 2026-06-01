'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { createClient } from '../../../lib/supabase/client';
import styles from './WeeklySalary.module.css';

type Achiever = {
  id: string;
  numericId: string;
  name: string;
  achievedAt: string | null;
};

const SALARY_RANKS = [
  { id: 5, name: 'ADVANCER', color: '#ffb347' },
  { id: 6, name: 'PROGRESSOR', color: '#ff7eb3' },
  { id: 7, name: 'LEADER', color: '#7b2ff7' },
  { id: 8, name: 'PIONEER', color: '#00f2fe' },
  { id: 9, name: 'CHAMPION', color: '#4facfe' },
  { id: 10, name: 'LEGEND', color: '#fddb92' },
];

export default function WeeklySalaryPage() {
  const router = useRouter();
  const [globalBusiness, setGlobalBusiness] = useState<number | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [activeRankView, setActiveRankView] = useState<number | null>(null);
  const [achieversData, setAchieversData] = useState<Record<number, Achiever[]>>({});
  const [loadingAchievers, setLoadingAchievers] = useState<Record<number, boolean>>({});
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loadingRank, setLoadingRank] = useState(true);
  const [rankStatusData, setRankStatusData] = useState<any>(null);
  const [totalPending, setTotalPending] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function fetchGlobalBusiness() {
      try {
        const res = await fetch('/api/global-business');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setGlobalBusiness(data.totalGlobalBusiness || 0);
      } catch (err) {
        console.error(err);
        setGlobalBusiness(0); // fallback
      } finally {
        setLoadingBusiness(false);
      }
    }
    fetchGlobalBusiness();

    async function fetchRankStatus() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoadingRank(false); return; }

        const res = await fetch('/api/weekly-salary-status', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch rank status');
        
        const data = await res.json();
        setRankStatusData(data);
        setUserRank(data.maxRank);

        let sumPending = 0;
        Object.values(data.rankStatus).forEach((r: any) => {
          sumPending += r.pendingAmount;
        });
        setTotalPending(sumPending);

      } catch (err) {
        console.error('Error fetching user rank:', err);
      } finally {
        setLoadingRank(false);
      }
    }
    fetchRankStatus();
  }, []);

  const toggleAchievers = async (rankId: number) => {
    if (activeRankView === rankId) {
      setActiveRankView(null);
      return;
    }
    
    setActiveRankView(rankId);

    // If we haven't fetched this rank yet, fetch it
    if (!achieversData[rankId]) {
      setLoadingAchievers(prev => ({ ...prev, [rankId]: true }));
      try {
        const res = await fetch(`/api/global-achievers?rank=${rankId}`);
        if (!res.ok) throw new Error('Failed to fetch achievers');
        const data = await res.json();
        setAchieversData(prev => ({ ...prev, [rankId]: data.achievers || [] }));
      } catch (err) {
        console.error(err);
        setAchieversData(prev => ({ ...prev, [rankId]: [] }));
      } finally {
        setLoadingAchievers(prev => ({ ...prev, [rankId]: false }));
      }
    }
  };

  const handleClaimReward = async () => {
    if (totalPending <= 0) return;
    setClaiming(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/claim-weekly-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({})
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim reward');
      
      alert(`Successfully claimed $${data.amount}!`);
      setTotalPending(0);
      
      // Update local rankStatusData
      if (rankStatusData) {
        const updatedStatus = { ...rankStatusData.rankStatus };
        Object.keys(updatedStatus).forEach(k => {
          updatedStatus[k as any].pendingAmount = 0;
        });
        setRankStatusData({ ...rankStatusData, rankStatus: updatedStatus });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Weekly Income</h2>
            <span className={styles.logoSlogan}>Global Pool & Achievers</span>
          </div>
        </div>
        <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
          🔙 Back
        </button>
      </header>

      <main className={styles.main}>
        {/* Top Global Pool Box */}
        <section className={styles.globalPoolBox}>
          <div className={styles.glowOverlay}></div>
          <div className={styles.poolContent}>
            <h3 className={styles.poolTitle}>Total Global Company Business</h3>
            {loadingBusiness ? (
              <div className={styles.poolSpinner}>
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className={styles.poolAmount}>
                ${globalBusiness?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <p className={styles.poolSubtitle}>Aggregated Lifetime Platform Revenue</p>
          </div>
        </section>

        {/* Your Current Rank Badge */}
        <section className={styles.yourRankSection}>
          {loadingRank ? (
            <div className={styles.yourRankLoading}>
              <LoadingSpinner size="small" />
              <span>Checking your rank&hellip;</span>
            </div>
          ) : userRank && userRank >= 5 && userRank <= 10 ? (
            <div
              className={styles.yourRankBadge}
              style={{
                borderColor: SALARY_RANKS.find(r => r.id === userRank)?.color || '#00d2ff',
                boxShadow: `0 0 25px ${SALARY_RANKS.find(r => r.id === userRank)?.color || '#00d2ff'}33`,
              }}
            >
              <div className={styles.yourRankGlow} style={{ background: `radial-gradient(circle, ${SALARY_RANKS.find(r => r.id === userRank)?.color || '#00d2ff'}22 0%, transparent 70%)` }} />
              <div className={styles.yourRankContent}>
                <span className={styles.yourRankLabel}>Your Current Rank</span>
                <div className={styles.yourRankNumber} style={{ color: SALARY_RANKS.find(r => r.id === userRank)?.color }}>
                  {userRank}
                </div>
                <div className={styles.yourRankName} style={{ color: SALARY_RANKS.find(r => r.id === userRank)?.color }}>
                  {SALARY_RANKS.find(r => r.id === userRank)?.name}
                </div>
                {totalPending > 0 ? (
                  <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#fff', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Pending Salary:</span>
                      <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>${Number(totalPending).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleClaimReward}
                      disabled={claiming}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: claiming ? 'not-allowed' : 'pointer',
                        width: '100%',
                        opacity: claiming ? 0.7 : 1
                      }}
                    >
                      {claiming ? 'Processing...' : 'Claim All Rewards Now'}
                    </button>
                  </div>
                ) : (
                  <span className={styles.yourRankSub}>You qualify for weekly income rewards! Check back when admin distributes the pool.</span>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.yourRankBadge} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <div className={styles.yourRankContent}>
                <span className={styles.yourRankLabel}>Your Current Rank</span>
                <div className={styles.yourRankName} style={{ color: '#8892b0', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                  {userRank ? `Rank ${userRank}` : 'No Rank Yet'}
                </div>
                <span className={styles.yourRankSub}>Reach Rank 5 (ADVANCER) to start earning weekly income!</span>
              </div>
            </div>
          )}
        </section>

        {/* Ranks List */}
        <section className={styles.ranksSection}>
          <h2 className={styles.sectionTitle}>Weekly Income Qualifiers</h2>
          
          <div className={styles.rankList}>
            {SALARY_RANKS.map((rank) => {
              const statusData = rankStatusData?.rankStatus[rank.id];
              
              return (
              <div key={rank.id} className={`${styles.rankCard} ${activeRankView === rank.id ? styles.activeCard : ''}`}>
                <div className={styles.rankHeader}>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankIcon} style={{ borderColor: rank.color, color: rank.color }}>
                      {rank.id}
                    </div>
                    <div>
                      <span className={styles.rankName} style={{ color: rank.color }}>{rank.name}</span>
                      
                      {statusData && statusData.status !== 'locked' && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#8892b0' }}>
                          Status: <span style={{ 
                            color: statusData.status === 'completed' ? '#2ecc71' : '#00d2ff',
                            fontWeight: 'bold'
                          }}>
                            {statusData.status === 'completed' ? 'Completed 2x Limit' : 'Active'}
                          </span>
                          <span style={{ marginLeft: '8px' }}>
                            (${statusData.totalEarned.toFixed(2)} / ${statusData.maxCap.toFixed(2)})
                          </span>
                        </div>
                      )}
                      {statusData && statusData.pendingAmount > 0 && (
                        <div style={{ fontSize: '0.75rem', marginTop: '2px', color: '#f39c12', fontWeight: 'bold' }}>
                          + ${statusData.pendingAmount.toFixed(2)} Pending
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    className={styles.viewBtn} 
                    onClick={() => toggleAchievers(rank.id)}
                    style={{ borderColor: activeRankView === rank.id ? rank.color : 'rgba(255,255,255,0.2)' }}
                  >
                    {activeRankView === rank.id ? 'Hide Achievers' : 'View Achievers'}
                  </button>
                </div>

                {/* Achievers Dropdown */}
                {activeRankView === rank.id && (
                  <div className={styles.achieversList}>
                    {loadingAchievers[rank.id] ? (
                      <div className={styles.loadingWrapper}>
                        <LoadingSpinner size="small" />
                        <span>Loading global achievers...</span>
                      </div>
                    ) : achieversData[rank.id]?.length > 0 ? (
                      <div className={styles.achieversGrid}>
                        {achieversData[rank.id].map((achiever, idx) => (
                          <div key={achiever.id} className={styles.achieverItem}>
                            <div className={styles.achieverAvatar}>{achiever.name.charAt(0).toUpperCase()}</div>
                            <div className={styles.achieverDetails}>
                              <span className={styles.achieverName}>{achiever.name}</span>
                              <span className={styles.achieverId}>ID: {achiever.numericId}</span>
                            </div>
                            {achiever.achievedAt && (
                              <div className={styles.achieverDate}>
                                {new Date(achiever.achievedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noAchievers}>
                        No users have reached {rank.name} yet. Will you be the first?
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>
        </section>
      </main>
    </div>
  );
}
