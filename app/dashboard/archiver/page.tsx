"use client";
import React, { useEffect, useState } from 'react';
import styles from './archiver.module.css';

export default function ArchiverPage() {
  const [data, setData] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/archiver');
      if (!res.ok) throw new Error('Failed to fetch archiver data');
      const json = await res.json();
      setData(json.data || {});
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const ranks = [5, 6, 7, 8, 9, 10];

  return (
    <div className={styles.archiverContainer}>
      <h1 className={styles.sectionTitle}>Global Archiver – Users by Rank</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        ranks.map(rank => (
          <section key={rank} className={styles.rankSection}>
            <h2 className={styles.rankHeader}>Rank {rank}</h2>
            <div className={styles.achieversGrid}>
              {(data[rank] || []).map(user => (
                <div key={user.id} className={styles.achieverCard}>
                  <div className={styles.achieverAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.achieverName}>{user.name}</div>
                  <div className={styles.achieverId}>ID: {user.numericId}</div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

"use client"\nimport React, { useEffect, useState } from 'react';\nimport styles from './archiver.module.css';\n\nexport default function ArchiverPage() {\n  // Data grouped by rank (5-10)\n  const [data, setData] = useState<Record<number, any[]>>({});\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  // Fetch all achievers grouped by rank\n  const fetchData = async () => {\n    setLoading(true);\n    try {\n      const res = await fetch('/api/archiver');\n      if (!res.ok) throw new Error('Failed to fetch archiver data');\n      const json = await res.json();\n      setData(json.data || {});\n    } catch (e: any) {\n      console.error(e);\n      setError(e.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  useEffect(() => {\n    fetchData();\n    const interval = setInterval(fetchData, 30000); // refresh every 30 sec\n    return () => clearInterval(interval);\n  }, []);\n\n  const ranks = [5, 6, 7, 8, 9, 10];\n\n  return (\n    <div className={styles.archiverContainer}>\n      <h1 className={styles.sectionTitle}>Global Archiver – Users by Rank</h1>\n      {error && <p style={{ color: 'red' }}>Error: {error}</p>}\n      {loading ? (\n        <p>Loading…</p>\n      ) : (\n        ranks.map(rank => (\n          <section key={rank} className={styles.rankSection}>\n            <h2 className={styles.rankHeader}>Rank {rank}</h2>\n            <div className={styles.achieversGrid}>\n              {(data[rank] || []).map(user => (\n                <div key={user.id} className={styles.achieverCard}>\n                  <div className={styles.achieverAvatar}>{user.name.charAt(0).toUpperCase()}</div>\n                  <div className={styles.achieverName}>{user.name}</div>\n                  <div className={styles.achieverId}>ID: {user.numericId}</div>\n                </div>\n              ))}\n            </div>\n          </section>\n        ))\n      )}\n    </div>\n  );\n}\n"
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
