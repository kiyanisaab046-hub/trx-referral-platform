'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { 
  Tv, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Save, 
  ExternalLink,
  Layers,
  Users
} from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminAdsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [isEnabled, setIsEnabled] = useState(true);
  const [adNetworkUrl, setAdNetworkUrl] = useState('');
  const [rewardAmount, setRewardAmount] = useState('0.05');
  const [dailyLimit, setDailyLimit] = useState('10');
  const [cooldownSeconds, setCooldownSeconds] = useState('30');
  const [watchDuration, setWatchDuration] = useState('15');

  // Stats
  const [totalWatched, setTotalWatched] = useState(0);
  const [totalTrxPaid, setTotalTrxPaid] = useState(0);
  const [todayWatched, setTodayWatched] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch settings
      const res = await fetch('/api/ads/settings');
      const data = await res.json();
      if (data?.settings) {
        setIsEnabled(data.settings.is_enabled ?? true);
        setAdNetworkUrl(data.settings.ad_network_url || '');
        setRewardAmount(String(data.settings.reward_amount ?? '0.05'));
        setDailyLimit(String(data.settings.daily_limit_per_user ?? '10'));
        setCooldownSeconds(String(data.settings.cooldown_seconds ?? '30'));
        setWatchDuration(String(data.settings.watch_duration_seconds ?? '15'));
      }

      // 2. Fetch stats from ad_views
      const { data: views, error: viewsErr } = await supabase
        .from('ad_views')
        .select('reward_amount, created_at');

      if (!viewsErr && views) {
        setTotalWatched(views.length);
        const sum = views.reduce((acc, row) => acc + Number(row.reward_amount || 0), 0);
        setTotalTrxPaid(parseFloat(sum.toFixed(4)));

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayCount = views.filter(v => new Date(v.created_at) >= todayStart).length;
        setTodayWatched(todayCount);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated. Please log in as admin.');
      }

      const res = await fetch('/api/ads/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          is_enabled: isEnabled,
          ad_network_url: adNetworkUrl,
          reward_amount: parseFloat(rewardAmount) || 0.05,
          daily_limit_per_user: parseInt(dailyLimit, 10) || 10,
          cooldown_seconds: parseInt(cooldownSeconds, 10) || 30,
          watch_duration_seconds: parseInt(watchDuration, 10) || 15
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update ad settings');
      }

      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Profit Simulation calculation
  const rewardNum = parseFloat(rewardAmount) || 0;
  const sampleViews = 1000;
  const userCostTrx = sampleViews * rewardNum;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Tv style={{ color: '#FF7E67' }} /> Ads & Monetization Control
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem', fontSize: '0.95rem' }}>
            Control user watch-to-earn limits, Monetag direct links, reward payouts, and profit margins.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '12px'
        }}>
          <span style={{ fontSize: '0.9rem', color: isEnabled ? '#10B981' : '#EF4444', fontWeight: '700' }}>
            ● {isEnabled ? 'Watch & Earn Active' : 'System Paused'}
          </span>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              border: 'none',
              background: isEnabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isEnabled ? '#EF4444' : '#10B981',
              transition: '0.2s'
            }}
          >
            {isEnabled ? 'Pause System' : 'Enable System'}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '1rem 1.2rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #EF4444',
          color: '#EF4444',
          padding: '1rem 1.2rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {/* Analytics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 126, 103, 0.15)',
          padding: '1.4rem',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>TOTAL ADS WATCHED</span>
            <Tv size={18} style={{ color: '#FF7E67' }} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0 }}>
            {totalWatched.toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Across all registered members</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 126, 103, 0.15)',
          padding: '1.4rem',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>TODAY'S AD VIEWS</span>
            <TrendingUp size={18} style={{ color: '#38BDF8' }} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#38BDF8', margin: 0 }}>
            {todayWatched.toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Reset daily at 00:00 UTC</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 126, 103, 0.15)',
          padding: '1.4rem',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>TOTAL TRX DISTRIBUTED</span>
            <DollarSign size={18} style={{ color: '#F59E0B' }} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#F59E0B', margin: 0 }}>
            {totalTrxPaid.toLocaleString()} TRX
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Credited directly to user wallets</span>
        </div>
      </div>

      {/* Main Settings Form & Profit Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Controls Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck style={{ color: '#FF7E67' }} /> Watch-to-Earn Rules & Limits
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Direct Link URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#F7E1D7', marginBottom: '0.4rem' }}>
                Monetag Direct Link URL
              </label>
              <input
                type="url"
                required
                placeholder="https://5gvci.com/... or your Monetag SmartLink"
                value={adNetworkUrl}
                onChange={(e) => setAdNetworkUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 126, 103, 0.3)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', display: 'block' }}>
                Paste the Direct Link provided in your Monetag account (under Direct Link ➔ Get Link).
              </span>
            </div>

            {/* Reward Per Ad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#F7E1D7', marginBottom: '0.4rem' }}>
                  Reward Per Ad (TRX)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 126, 103, 0.3)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#F7E1D7', marginBottom: '0.4rem' }}>
                  Daily Limit Per User
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 126, 103, 0.3)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Timer & Cooldown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#F7E1D7', marginBottom: '0.4rem' }}>
                  Timer Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  required
                  value={watchDuration}
                  onChange={(e) => setWatchDuration(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 126, 103, 0.3)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>
                  User must stay on tab for this long.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#F7E1D7', marginBottom: '0.4rem' }}>
                  Cooldown Between Ads (s)
                </label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  required
                  value={cooldownSeconds}
                  onChange={(e) => setCooldownSeconds(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 126, 103, 0.3)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>
                  Anti-spam wait time before next ad.
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: '0.8rem',
                background: 'linear-gradient(135deg, #FF7E67 0%, #FFC371 100%)',
                color: '#111',
                fontWeight: '800',
                fontSize: '1rem',
                padding: '0.9rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(255, 126, 103, 0.3)',
                transition: '0.2s'
              }}
            >
              <Save size={18} /> {saving ? 'Saving Changes...' : 'Save & Apply Settings'}
            </button>
          </form>
        </div>

        {/* Business & Profit Blueprint Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 126, 103, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 126, 103, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFC371', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Profit & Business Calculator
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Here is how you earn income while sharing rewards with users:
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '14px',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Example Ad Impressions:</span>
              <strong style={{ color: '#fff' }}>1,000 views</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Monetag Payout to You (Est. CPM):</span>
              <strong style={{ color: '#10B981' }}>~$2.00 - $8.00 USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>You Pay to Users ({sampleViews} × {rewardNum} TRX):</span>
              <strong style={{ color: '#F59E0B' }}>{userCostTrx.toFixed(2)} TRX</strong>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: '#FF7E67', fontWeight: '700' }}>Your Retained Net Profit:</span>
              <strong style={{ color: '#10B981' }}>~40% to 70%</strong>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.5
          }}>
            💡 <strong style={{ color: '#fff' }}>Best Practice Tip</strong>: If you set the reward to <span style={{ color: '#FFC371' }}>0.05 TRX</span> (~$0.01) and daily limit to <span style={{ color: '#FFC371' }}>10 ads</span>, users can earn <span style={{ color: '#FFC371' }}>0.5 TRX/day</span>. This keeps them highly engaged daily while you generate continuous CPM revenue in Monetag!
          </div>
        </div>

      </div>

    </div>
  );
}
