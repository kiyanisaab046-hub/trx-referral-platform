'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

export default function UnderConstruction() {
  const router = useRouter();
  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#fff' }}>🚧 Under Construction 🚧</h1>
      <p style={{ color: '#bbb' }}>The Tree view is being updated. Please check back later.</p>
      <button onClick={() => router.push('/dashboard')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #00d2ff, #0080ff)', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
        Back to Dashboard
      </button>
    </div>
  );
}
