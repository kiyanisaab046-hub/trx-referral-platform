import React, { useEffect, useState } from 'react';
import styles from './archiver.module.css';

// Ranks we care about (5 to 10 inclusive)
const RANKS = [5, 6, 7, 8, 9, 10];

export default function ArchiverPage() {
  // Store achievers per rank
  const [data, setData] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch achievers for all ranks, refresh every 30 seconds
  const fetchRank = async (rank: number) => {
    setLoading(prev => ({ ...prev, [rank]: true }));
    try {
      const res = await fetch(`/api/global-achievers?rank=${rank}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(prev => ({ ...prev, [rank]: json.achievers || [] }));
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(prev => ({ ...prev, [rank]: false }));
    }
  };

  useEffect(() => {
    // initial load
    RANKS.forEach(fetchRank);
    // set interval for real‑time refresh
    const interval = setInterval(() => {
      RANKS.forEach(fetchRank);
    }, 30000); // 30 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.archiverContainer}>
      <h1 className={styles.sectionTitle}>Global Archiver – Users by Rank</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {RANKS.map(rank => (
        <section key={rank} className={styles.rankSection}>
          <h2 className={styles.rankHeader}>Rank {rank}</h2>
          {loading[rank] ? (
            <p>Loading…</p>
          ) : (
            <div className={styles.achieversGrid}>
              {(data[rank] || []).map(user => (
                <div key={user.id} className={styles.achieverCard}>
                  <div className={styles.achieverAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.achieverName}>{user.name}</div>
                  <div className={styles.achieverId}>ID: {user.numericId}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
