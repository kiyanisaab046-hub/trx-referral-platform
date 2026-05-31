'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function WeeklyIncomePage() {
  const router = useRouter();

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', backgroundColor: '#050508' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Weekly Income</h2>
            <span className={styles.logoSlogan}>Coming Soon</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            ⬅ Back to Dashboard
          </button>
        </div>
      </header>

      <main style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>
          Under Construction
        </h1>
        <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' }}>
          We are currently building out the Weekly Income page. Check back soon for detailed breakdowns and analytics of your weekly earnings!
        </p>
      </main>
    </div>
  );
}
