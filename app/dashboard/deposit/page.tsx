"use client";
import React, { useState } from 'react';
import CryptoPayButton from '../../../components/CryptoPayButton';

export default function DepositPage() {
  const [amount, setAmount] = useState(10);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Deposit via Crypto</h1>
      <p>Choose an amount to add to your deposit balance.</p>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={handleAmountChange}
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '120px' }}
        placeholder="Amount"
      />
      <CryptoPayButton amount={amount} description="Deposit funds" />
    </div>
  );
}
