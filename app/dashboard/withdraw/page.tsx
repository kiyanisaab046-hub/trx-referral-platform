'use client';
import React, { useState } from 'react';

export default function WithdrawPage() {
  const [amount, setAmount] = useState(10);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleWithdraw = async () => {
    if (!address) {
      setMsg('Please enter a crypto address');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'bnb',
          address,
          orderId: `wd-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ Withdrawal request sent. Payout ID: ${data.payout_id || data.id}`);
      } else {
        setMsg(`❌ ${data.error || 'Withdrawal failed'}`);
      }
    } catch (e) {
      setMsg('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '2rem',
    }}>
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #1a1a1a',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '460px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Withdraw via Crypto</h1>
        <p style={{ color: '#8c8c8c', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Select amount to withdraw from your balance.</p>

        <input
          type="number"
          min="0"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Amount (USD)"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 1rem',
            marginBottom: '0.75rem',
            background: '#111',
            border: '1px solid #222',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Your BNB wallet address"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: '#111',
            border: '1px solid #222',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={handleWithdraw}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            background: loading ? '#555' : 'linear-gradient(135deg, #00d2ff, #ff6b6b)',
            color: '#000',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '1rem',
            fontWeight: 700,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Processing…' : 'Withdraw with Crypto'}
        </button>

        {msg && (
          <p style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: msg.startsWith('✅') ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}>
            {msg}
          </p>
        )}

        <a href="/dashboard" style={{ display: 'inline-block', marginTop: '1.25rem', color: '#00d2ff', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
