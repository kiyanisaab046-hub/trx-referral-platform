import React, { useState } from 'react';
import CryptoPayButton from '../../../components/CryptoPayButton';

export default function WithdrawPage() {
  const [amount, setAmount] = useState(10);

  const handleAmountChange = (e) => {
    const val = parseFloat(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
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
        style={{ padding: '0.5rem', marginBottom: '1rem', width: '120px' }}
        placeholder="Amount"
      />
      <CryptoPayButton amount={amount} description="Withdraw funds" />
    </div>
  );
}
