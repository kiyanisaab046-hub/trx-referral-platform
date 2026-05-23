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
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Withdraw via Crypto</h1>
      <p>Select amount to withdraw from your balance.</p>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={handleAmountChange}
        placeholder="Amount (USD)"
        style={{ padding: '0.5rem', marginBottom: '0.5rem', width: '140px' }}
      />
      <br />
      <input
        type="text"
        value={address}
        onChange={handleAddressChange}
        placeholder="Your BNB address"
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '260px' }}
      />
      <br />
      <button
        onClick={handleWithdraw}
        disabled={loading}
        style={{
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          background: loading ? '#888' : '#ff9a86',
          color: '#000',
          border: 'none',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Processing…' : 'Withdraw with Crypto'}
      </button>
      {msg && <p style={{ marginTop: '1rem' }}>{msg}</p>}
    </div>
  );
}
