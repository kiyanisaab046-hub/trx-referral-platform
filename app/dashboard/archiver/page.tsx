"use client";

import React, { useEffect, useState } from "react";
import styles from "./archiver.module.css";

interface User {
  id: string;
  name: string;
  numericId: string;
}

type RankData = Record<number, User[]>;

export default function ArchiverPage() {
  const [data, setData] = useState<RankData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/archiver");
      if (!res.ok) throw new Error("Failed to fetch archiver data");
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
      <h1 className={styles.sectionTitle}>Global Archiver &ndash; Users by Rank</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {loading ? (
        <p>Loading&hellip;</p>
      ) : (
        ranks.map((rank) => (
          <section key={rank} className={styles.rankSection}>
            <h2 className={styles.rankHeader}>Rank {rank}</h2>
            <div className={styles.achieversGrid}>
              {(data[rank] || []).map((user) => (
                <div key={user.id} className={styles.achieverCard}>
                  <div className={styles.achieverAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
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
