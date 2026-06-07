"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function DepositPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
      <h2>Deposit Funds</h2>
      <p style={{ color: '#8892b0', marginBottom: '2rem' }}>Please use the "Deposit" button on your main dashboard to add funds.</p>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{ padding: '0.8rem 1.5rem', background: '#00d2ff', color: 'black', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
