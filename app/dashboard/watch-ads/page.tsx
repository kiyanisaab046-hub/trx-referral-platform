'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { 
  Tv, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  AlertCircle,
  ExternalLink,
  Flame,
  Award,
  RefreshCw
} from 'lucide-react';
import styles from '../dashboard.module.css';

interface AdSettings {
  is_enabled: boolean;
  daily_limit_per_user: number;
  cooldown_seconds: number;
  reward_amount: number;
  watch_duration_seconds: number;
  ad_network_url: string;
}

interface UserStats {
  watchedToday: number;
  remainingToday: number;
  canWatch: boolean;
  secondsUntilNextAd: number;
  totalEarned: number;
}

interface AdHistoryItem {
  id: string;
  reward_amount: number;
  duration_watched: number;
  created_at: string;
}

export default function WatchAdsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<{ main_balance: number; income_balance: number } | null>(null);
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [stats, setStats] = useState<UserStats>({
    watchedToday: 0,
    remainingToday: 10,
    canWatch: true,
    secondsUntilNextAd: 0,
    totalEarned: 0
  });
  const [history, setHistory] = useState<AdHistoryItem[]>([]);

  // Watch flow state
  // 'idle' | 'watching' | 'ready_to_claim' | 'claiming' | 'cooldown'
  const [watchState, setWatchState] = useState<'idle' | 'watching' | 'ready_to_claim' | 'claiming' | 'cooldown'>('idle');
  const [timerRemaining, setTimerRemaining] = useState(15);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [tabIsActive, setTabIsActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }

      // Fetch user wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('main_balance, income_balance')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }

      // Fetch ad settings and stats
      const res = await fetch('/api/ads/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();

      if (data?.settings) {
        setSettings(data.settings);
        setTimerRemaining(data.settings.watch_duration_seconds || 15);
      }
      if (data?.userStats) {
        setStats(data.userStats);
        if (data.userStats.secondsUntilNextAd > 0) {
          startCooldown(data.userStats.secondsUntilNextAd);
        }
      }

      // Fetch user's recent ad views
      const { data: historyData } = await supabase
        .from('ad_views')
        .select('id, reward_amount, duration_watched, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (historyData) {
        setHistory(historyData);
      }

    } catch (err: any) {
      console.error('Error loading ads data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Tab focus detection for anti-cheat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabIsActive(false);
      } else {
        setTabIsActive(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. Watch Timer Handler
  useEffect(() => {
    if (watchState === 'watching') {
      if (!tabIsActive) {
        // Pause timer if user leaves tab
        return;
      }

      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setWatchState('ready_to_claim');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [watchState, tabIsActive]);

  // 4. Cooldown Handler
  const startCooldown = (seconds: number) => {
    setWatchState('cooldown');
    setCooldownRemaining(seconds);

    if (cooldownRef.current) clearInterval(cooldownRef.current);

    cooldownRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          setWatchState('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 5. Action: Start Watching Ad
  const handleStartWatch = () => {
    if (!settings || !settings.is_enabled) {
      setStatusMessage({ type: 'error', text: 'Ad system is currently paused.' });
      return;
    }
    if (stats.remainingToday <= 0) {
      setStatusMessage({ type: 'error', text: 'You have completed all ads for today!' });
      return;
    }
    if (watchState === 'cooldown') {
      setStatusMessage({ type: 'error', text: 'Please wait for cooldown to expire.' });
      return;
    }

    setStatusMessage(null);
    setTimerRemaining(settings.watch_duration_seconds || 15);
    setWatchState('watching');

    // Open sponsor ad in a new tab
    const adUrl = settings.ad_network_url && settings.ad_network_url.startsWith('http')
      ? settings.ad_network_url
      : 'https://omg10.com/4/11881517';

    window.open(adUrl, '_blank', 'noopener,noreferrer');
  };

  // 6. Action: Claim Reward
  const handleClaimReward = async () => {
    try {
      setWatchState('claiming');
      setStatusMessage(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in');

      const res = await fetch('/api/ads/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          durationWatched: settings?.watch_duration_seconds || 15
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim reward');
      }

      // Success! Update local state
      setStatusMessage({
        type: 'success',
        text: `🎉 Success! +$${data.rewardCredited} credited to your Income Wallet!`
      });

      // Update balances
      setWallet((prev) => prev ? {
        ...prev,
        income_balance: data.newIncomeBalance,
        main_balance: prev.main_balance + data.rewardCredited
      } : null);

      setStats((prev) => ({
        ...prev,
        watchedToday: data.watchedToday,
        remainingToday: data.remainingToday,
        totalEarned: parseFloat((prev.totalEarned + data.rewardCredited).toFixed(4))
      }));

      // Add to history
      setHistory((prev) => [
        {
          id: String(Date.now()),
          reward_amount: data.rewardCredited,
          duration_watched: settings?.watch_duration_seconds || 15,
          created_at: new Date().toISOString()
        },
        ...prev.slice(0, 7)
      ]);

      // Trigger cooldown
      startCooldown(data.cooldownSeconds || settings?.cooldown_seconds || 30);

    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message });
      setWatchState('idle');
    }
  };

  const totalDuration = settings?.watch_duration_seconds || 15;
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - timerRemaining) / totalDuration) * 100));

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 10%, #150f24 0%, #06040a 100%)' }}>
      
      {/* Top Header */}
      <header className={styles.header} style={{ borderBottom: '1px solid rgba(255, 126, 103, 0.2)' }}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <div style={{
              background: 'linear-gradient(135deg, #FF7E67, #FFC371)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: '900'
            }}>
              <Tv size={20} />
            </div>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText} style={{ background: 'linear-gradient(to right, #FF7E67, #FFC371)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Watch & Earn
            </h2>
            <span className={styles.logoSlogan}>Rewarded Ad Arena</span>
          </div>
        </div>

        <div className={styles.profileHeader}>
          <button 
            className={styles.homeBtn} 
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: 'rgba(255, 126, 103, 0.4)',
              color: '#FF7E67'
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Wallet & Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Income Wallet */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 126, 103, 0.2)',
            borderRadius: '16px',
            padding: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ background: 'rgba(255, 126, 103, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#FF7E67' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income Wallet</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                ${wallet ? Number(wallet.income_balance).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>

          {/* Today's Limit */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#38BDF8' }}>
              <Award size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Ads Done</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {stats.watchedToday} / {settings?.daily_limit_per_user || 10}
              </h3>
            </div>
          </div>

          {/* Reward Per View */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#10B981' }}>
              <Flame size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reward Per Ad</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10B981', margin: 0 }}>
                +${settings?.reward_amount ?? '0.05'}
              </h3>
            </div>
          </div>
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div style={{
            background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? '#10B981' : '#EF4444'}`,
            color: statusMessage.type === 'success' ? '#10B981' : '#EF4444',
            padding: '1rem 1.2rem',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: '600'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Interactive Watch-to-Earn Arena Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 126, 103, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 126, 103, 0.25)',
          borderRadius: '24px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* State 1: Watching Active */}
          {watchState === 'watching' && (
            <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255, 126, 103, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #FF7E67',
                boxShadow: '0 0 25px rgba(255, 126, 103, 0.4)'
              }}>
                <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff' }}>
                  {timerRemaining}s
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #FF7E67, #FFC371)',
                  transition: 'width 1s linear'
                }} />
              </div>

              {!tabIsActive ? (
                <div style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '700' }}>
                  <AlertCircle size={18} /> Timer paused! Please keep this tab open to continue.
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                  Viewing sponsor ad in progress... please wait until the countdown ends!
                </p>
              )}
            </div>
          )}

          {/* State 2: Ready to Claim */}
          {watchState === 'ready_to_claim' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', animation: 'fadeIn 0.4s ease' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                padding: '1.2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={40} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                Verification Complete!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>
                Click below to claim your reward instantly.
              </p>
              <button
                onClick={handleClaimReward}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '1rem 2.5rem',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 25px rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: '0.2s'
                }}
              >
                <CheckCircle2 size={22} /> Claim +${settings?.reward_amount ?? '0.05'} Reward
              </button>
            </div>
          )}

          {/* State 3: Claiming in progress */}
          {watchState === 'claiming' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <RefreshCw size={36} style={{ color: '#FF7E67', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#fff', fontWeight: '700' }}>Crediting your wallet balance...</p>
            </div>
          )}

          {/* State 4: Cooldown active */}
          {watchState === 'cooldown' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}>
                <Clock size={36} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                Next Ad in {cooldownRemaining}s
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                Please take a quick breather before the next rewarded ad is available.
              </p>
            </div>
          )}

          {/* State 5: Idle (Ready to watch) or Daily Limit Reached */}
          {watchState === 'idle' && (
            <>
              {stats.remainingToday > 0 ? (
                <>
                  <div style={{
                    background: 'rgba(255, 126, 103, 0.12)',
                    color: '#FF7E67',
                    padding: '1.2rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Tv size={42} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                      Watch Ad & Earn Dollars
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                      Watch a sponsor promotion for {settings?.watch_duration_seconds || 15} seconds to earn <strong style={{ color: '#FFC371' }}>+${settings?.reward_amount ?? '0.05'}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleStartWatch}
                    disabled={!settings?.is_enabled}
                    style={{
                      background: 'linear-gradient(135deg, #FF7E67 0%, #FFC371 100%)',
                      color: '#0a0710',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '1.1rem 2.8rem',
                      fontSize: '1.15rem',
                      fontWeight: '800',
                      cursor: settings?.is_enabled ? 'pointer' : 'not-allowed',
                      boxShadow: '0 6px 25px rgba(255, 126, 103, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      transition: '0.2s',
                      opacity: settings?.is_enabled ? 1 : 0.6
                    }}
                  >
                    <ExternalLink size={20} /> Watch Ad Now ({settings?.watch_duration_seconds || 15}s)
                  </button>

                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                    {stats.remainingToday} ads remaining today • Cooldown: {settings?.cooldown_seconds || 30}s
                  </span>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                  <Award size={48} style={{ color: '#10B981' }} />
                  <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                    Daily Goal Completed! 🎉
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '450px', lineHeight: 1.5, margin: 0 }}>
                    You have watched all {settings?.daily_limit_per_user || 10} ads for today. Your daily limit resets at midnight UTC!
                  </p>
                </div>
              )}
            </>
          )}

        </div>

        {/* Watch History Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '1.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: '#FF7E67' }} /> Recent Ad Rewards
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Total Earned: <strong style={{ color: '#10B981' }}>${stats.totalEarned}</strong>
            </span>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              No ads watched yet today. Click "Watch Ad Now" above to start earning!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '0.8rem' }}>Time</th>
                    <th style={{ padding: '0.8rem' }}>Duration</th>
                    <th style={{ padding: '0.8rem' }}>Reward</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.8rem', color: '#fff' }}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                        {item.duration_watched}s
                      </td>
                      <td style={{ padding: '0.8rem', color: '#10B981', fontWeight: '700' }}>
                        +${item.reward_amount}
                      </td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
