'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Rewards from '../../../components/Rewards';
import styles from '../dashboard.module.css';

export default function RewardDetailsPage() {
  const router = useRouter();

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', backgroundColor: '#050508' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Reward Details</h2>
            <span className={styles.logoSlogan}>Track & Claim</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            ⬅ Back to Dashboard
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: '4rem' }}>
        <Rewards />
      </main>
    </div>
  );
}
