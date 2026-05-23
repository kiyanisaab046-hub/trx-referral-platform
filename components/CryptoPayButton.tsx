"use client";
import { useState } from 'react';

interface Props {
  amount: number; // amount in target currency (e.g., BNB)
  description: string;
  onSuccess?: () => void;
}

export default function CryptoPayButton({ amount, description, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, userId: '' }) // userId can be added via auth if needed
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        // Open checkout in a new tab for best UX
        window.open(data.checkoutUrl, '_blank');
        onSuccess?.();
      } else {
        alert(data.error || 'Failed to initialize payment. Please check your configuration.');
        console.error('Payment API error:', data);
      }
    } catch (e) {
      console.error('NowPayments error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      className="crypto-pay-btn"
    >
      {loading ? 'Processing…' : 'Pay with Crypto'}
    </button>
  );
}
