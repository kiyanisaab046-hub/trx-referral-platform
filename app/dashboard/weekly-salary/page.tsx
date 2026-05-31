'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Weekly Salary</h2>
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

        {/* Ranks List */}
        <section className={styles.ranksSection}>
          <h2 className={styles.sectionTitle}>Weekly Salary Qualifiers</h2>
          
          <div className={styles.rankList}>
            {SALARY_RANKS.map((rank) => (
              <div key={rank.id} className={`${styles.rankCard} ${activeRankView === rank.id ? styles.activeCard : ''}`}>
                <div className={styles.rankHeader}>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankIcon} style={{ borderColor: rank.color, color: rank.color }}>
                      {rank.id}
                    </div>
                    <span className={styles.rankName} style={{ color: rank.color }}>{rank.name}</span>
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
