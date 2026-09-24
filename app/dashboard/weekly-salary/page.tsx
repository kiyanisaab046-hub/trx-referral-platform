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
  const [directsCount, setDirectsCount] = useState<number>(0);
  const [claiming, setClaiming] = useState(false);
  const [claimingRank, setClaimingRank] = useState<number | null>(null);

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
        setDirectsCount(data.directsCount || 0);

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

  // Claim rewards for a specific rank
  const handleClaimByRank = async (rankLevel: number) => {
    const statusData = rankStatusData?.rankStatus[rankLevel];
    if (!statusData || statusData.pendingAmount <= 0) return;
    setClaimingRank(rankLevel);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/claim-weekly-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ rank: rankLevel })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim reward');
      
      const rankName = SALARY_RANKS.find(r => r.id === rankLevel)?.name || `Rank ${rankLevel}`;
      alert(`Successfully claimed $${data.amount} from ${rankName}!`);
      
      // Update local state for this rank only
      if (rankStatusData) {
        const updatedStatus = { ...rankStatusData.rankStatus };
        const prev = updatedStatus[rankLevel];
        updatedStatus[rankLevel] = {
          ...prev,
          totalEarned: prev.totalEarned + prev.pendingAmount,
          pendingAmount: 0,
          status: (prev.totalEarned + prev.pendingAmount) >= prev.maxCap ? 'completed' : prev.status
        };
        setRankStatusData({ ...rankStatusData, rankStatus: updatedStatus });
        
        // Recalculate totalPending
        let newTotal = 0;
        Object.values(updatedStatus).forEach((r: any) => { newTotal += r.pendingAmount; });
        setTotalPending(newTotal);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setClaimingRank(null);
    }
  };

  // Legacy claim-all (kept for convenience)
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
      
      if (rankStatusData) {
        const updatedStatus = { ...rankStatusData.rankStatus };
        Object.keys(updatedStatus).forEach(k => {
          const prev = updatedStatus[k as any];
          updatedStatus[k as any] = {
            ...prev,
            totalEarned: prev.totalEarned + prev.pendingAmount,
            pendingAmount: 0,
            status: (prev.totalEarned + prev.pendingAmount) >= prev.maxCap ? 'completed' : prev.status
          };
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
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%', border: 'none' }} />
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

                {/* Single global directs badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                    background: directsCount >= 2 ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                    border: `1px solid ${directsCount >= 2 ? 'rgba(46,204,113,0.5)' : 'rgba(231,76,60,0.5)'}`,
                    color: directsCount >= 2 ? '#2ecc71' : '#ff6b6b'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{directsCount >= 2 ? '✅' : '⚠️'}</span>
                    Direct Members: {directsCount}/2
                    {directsCount >= 2 ? ' — All Ranks Unlocked!' : ' — Required to Claim'}
                  </div>
                </div>

                {totalPending > 0 ? (
                  <div style={{ marginTop: '1rem' }}>
                    
                    {directsCount < 2 && (
                      <div style={{
                        background: 'rgba(231, 76, 60, 0.15)',
                        border: '1px solid rgba(231, 76, 60, 0.5)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        color: '#ff6b6b',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        ⚠️ You have {directsCount} direct members. You must have at least 2 direct members to claim weekly income!
                      </div>
                    )}

                    {/* Per-Rank Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      {SALARY_RANKS.filter(r => {
                        const sd = rankStatusData?.rankStatus[r.id];
                        return sd && sd.pendingAmount > 0;
                      }).map(r => {
                        const sd = rankStatusData?.rankStatus[r.id];
                        const isClaimingThis = claimingRank === r.id;
                        return (
                          <div key={r.id} style={{
                            background: 'rgba(0,0,0,0.35)',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: `1px solid ${r.color}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                border: `2px solid ${r.color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 900, color: r.color, flexShrink: 0
                              }}>{r.id}</div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.75rem', color: r.color, fontWeight: 700 }}>{r.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#2ecc71', fontWeight: 'bold' }}>
                                  ${sd.pendingAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleClaimByRank(r.id)}
                              disabled={isClaimingThis || claiming || directsCount < 2}
                              style={{
                                padding: '0.4rem 0.8rem',
                                background: isClaimingThis ? 'rgba(46,204,113,0.3)' : `linear-gradient(135deg, ${r.color}, ${r.color}cc)`,
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                cursor: (isClaimingThis || claiming || directsCount < 2) ? 'not-allowed' : 'pointer',
                                opacity: (isClaimingThis || claiming || directsCount < 2) ? 0.4 : 1,
                                whiteSpace: 'nowrap',
                                letterSpacing: '0.02em'
                              }}
                            >
                              {isClaimingThis ? 'Claiming...' : 'Claim'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Summary + Claim All */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ color: '#fff', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Total Pending:</span>
                        <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>${Number(totalPending).toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handleClaimReward}
                        disabled={claiming || directsCount < 2}
                        style={{
                          padding: '0.45rem 1rem',
                          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          cursor: (claiming || directsCount < 2) ? 'not-allowed' : 'pointer',
                          width: '100%',
                          opacity: (claiming || directsCount < 2) ? 0.4 : 1
                        }}
                      >
                        {claiming ? 'Processing...' : 'Claim All Ranks At Once'}
                      </button>
                    </div>
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

                {/* Global directs badge for all users */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                    background: directsCount >= 2 ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                    border: `1px solid ${directsCount >= 2 ? 'rgba(46,204,113,0.5)' : 'rgba(231,76,60,0.5)'}`,
                    color: directsCount >= 2 ? '#2ecc71' : '#ff6b6b'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{directsCount >= 2 ? '✅' : '⚠️'}</span>
                    Direct Members: {directsCount}/2
                    {directsCount >= 2 ? ' — All Ranks Unlocked!' : ' — Required to Claim'}
                  </div>
                </div>
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

                      {statusData && statusData.status !== 'locked' && directsCount >= 2 && (
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
                      {statusData && statusData.pendingAmount > 0 && directsCount >= 2 && (
                        <div style={{ fontSize: '0.75rem', marginTop: '2px', color: '#f39c12', fontWeight: 'bold' }}>
                          + ${statusData.pendingAmount.toFixed(2)} Pending
                        </div>
                      )}
                      {directsCount < 2 && statusData && statusData.status !== 'locked' && (
                        <div style={{ fontSize: '0.72rem', marginTop: '4px', color: '#ff6b6b' }}>
                          🔒 Need 2 direct members to claim
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
