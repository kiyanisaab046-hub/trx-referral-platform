import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const GlobalPoolBox: React.FC = () => {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch('/api/global-business');
        const data = await res.json();
        if (res.ok) {
          setTotal(data.totalGlobalBusiness);
        } else {
          setError(data.error || 'Failed to load');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTotal();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-[#0a1a2b] p-6 shadow-lg transition-transform hover:scale-[1.02]">
      <div className="absolute inset-0 border-2 border-transparent rounded-xl bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-600 opacity-30 pointer-events-none" />
      <h2 className="text-xl font-bold text-white mb-2">Global Company Business Pool</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <p className="text-3xl font-mono text-green-300">${total?.toLocaleString()}</p>
      )}
      <Link href="/dashboard/global-pool-details" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        View Details
      </Link>
    </div>
  );
};

export default GlobalPoolBox;
