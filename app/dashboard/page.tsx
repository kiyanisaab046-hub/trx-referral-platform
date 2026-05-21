'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import styles from './dashboard.module.css';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  role: string;
}

interface Wallet {
  main_balance: number;
  deposit_balance: number;
  income_balance: number;
  withdrawal_balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ referralsCount: 0, teamCount: 0 });
  const [copied, setCopied] = useState(false);
  const [directSum, setDirectSum] = useState(0);
  const [levelSum, setLevelSum] = useState(0);
  const [debugInfo, setDebugInfo] = useState<{
    authUserId?: string;
    authUserEmail?: string;
    profileStatus?: string;
    walletStatus?: string;
    referralsStatus?: string;
    transactionsStatus?: string;
    urlOrigin?: string;
    errorMsg?: string;
  }>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      const logs: typeof debugInfo = {
        urlOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined',
      };
      try {
        // 1. Get logged-in user session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          logs.errorMsg = `Auth error: ${authError?.message || 'No active session'}`;
          setDebugInfo(logs);
          router.push('/signin');
          return;
        }

        logs.authUserId = authUser.id;
        logs.authUserEmail = authUser.email;

        // 2. Fetch public user profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, full_name, email, referral_code, role')
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            logs.profileStatus = `Error: ${profileError.message} (Code: ${profileError.code})`;
          } else if (!profile) {
            logs.profileStatus = 'Error: Profile is null/empty';
          } else {
            setUser(profile);
            logs.profileStatus = `Success (Ref code: ${profile.referral_code})`;
          }
        } catch (e: any) {
          logs.profileStatus = `Exception: ${e.message || e}`;
        }

        // 3. Fetch user wallet balances
        try {
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('main_balance, deposit_balance, income_balance, withdrawal_balance')
            .eq('user_id', authUser.id)
            .single();

          if (walletError) {
            logs.walletStatus = `Error: ${walletError.message} (Code: ${walletError.code})`;
          } else if (!walletData) {
            logs.walletStatus = 'Error: Wallet row is null/empty';
          } else {
            setWallet(walletData);
            logs.walletStatus = 'Success';
          }
        } catch (e: any) {
          logs.walletStatus = `Exception: ${e.message || e}`;
        }

        // 4. Fetch referrals count
        try {
          const { count: referralsCount, error: refError } = await supabase
            .from('referrals')
            .select('id', { count: 'exact', head: true })
            .eq('sponsor_id', authUser.id)
            .eq('level', 1);

          const { data: teamCount, error: teamError } = await supabase
            .rpc('get_team_size', { user_uuid: authUser.id });

          if (refError || teamError) {
            const errMsg = (refError?.message || '') + (teamError?.message || '');
            logs.referralsStatus = `Error: ${errMsg}`;
          } else {
            setStats({
              referralsCount: referralsCount || 0,
              teamCount: teamCount || 0,
            });
            logs.referralsStatus = `Success (Direct: ${referralsCount || 0}, Team: ${teamCount || 0})`;
          }
        } catch (e: any) {
          logs.referralsStatus = `Exception: ${e.message || e}`;
        }

        // 5. Fetch recent transactions
        try {
          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('id, amount, type, description, created_at')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (txError) {
            logs.transactionsStatus = `Error: ${txError.message} (Code: ${txError.code})`;
          } else {
            if (txData) {
              setTransactions(txData);
              const direct = txData
                .filter(t => t.type === 'commission_direct')
                .reduce((acc, curr) => acc + Number(curr.amount), 0);
              
              const lvl = txData
                .filter(t => t.type === 'commission_level')
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

              setDirectSum(direct);
              setLevelSum(lvl);
            }
            logs.transactionsStatus = 'Success';
          }
        } catch (e: any) {
          logs.transactionsStatus = `Exception: ${e.message || e}`;
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        logs.errorMsg = `Global catch: ${error.message || error}`;
      } finally {
        setDebugInfo(logs);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/signup?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic rank calculation
  const getRankInfo = (referrals: number) => {
    if (referrals >= 120) return { rank: 10, name: 'Legend', nextRank: 'Max Rank Reached', target: 120, progress: 100 };
    if (referrals >= 80) return { rank: 9, name: 'Champion', nextRank: 'Legend', target: 120, progress: Math.floor(((referrals - 80) / 40) * 100) };
    if (referrals >= 50) return { rank: 8, name: 'Pioneer', nextRank: 'Champion', target: 80, progress: Math.floor(((referrals - 50) / 30) * 100) };
    if (referrals >= 30) return { rank: 7, name: 'Leader', nextRank: 'Pioneer', target: 50, progress: Math.floor(((referrals - 30) / 20) * 100) };
    if (referrals >= 20) return { rank: 6, name: 'Progressor', nextRank: 'Leader', target: 30, progress: Math.floor(((referrals - 20) / 10) * 100) };
    if (referrals >= 15) return { rank: 5, name: 'Advancer', nextRank: 'Progressor', target: 20, progress: Math.floor(((referrals - 15) / 5) * 100) };
    if (referrals >= 10) return { rank: 4, name: 'Achiever', nextRank: 'Advancer', target: 15, progress: Math.floor(((referrals - 10) / 5) * 100) };
    if (referrals >= 5) return { rank: 3, name: 'Grower', nextRank: 'Achiever', target: 10, progress: Math.floor(((referrals - 5) / 5) * 100) };
    if (referrals >= 3) return { rank: 2, name: 'Builder', nextRank: 'Grower', target: 5, progress: Math.floor(((referrals - 3) / 2) * 100) };
    return { rank: 1, name: 'Starter', nextRank: 'Builder', target: 3, progress: Math.floor((referrals / 3) * 100) };
  };

  const rankInfo = getRankInfo(stats.referralsCount);
  const totalEarnings = (wallet?.income_balance || 0) + (wallet?.withdrawal_balance || 0);

  // Dynamic percentages for breakdown card
  const directPercent = totalEarnings > 0 ? Math.round((directSum / totalEarnings) * 100) : 0;
  const levelPercent = totalEarnings > 0 ? Math.round((levelSum / totalEarnings) * 100) : 0;
  const otherPercent = totalEarnings > 0 ? Math.max(0, 100 - directPercent - levelPercent) : 0;

  // Binary legs calculation
  const leftLegCount = Math.ceil(stats.teamCount / 2);
  const rightLegCount = Math.floor(stats.teamCount / 2);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const rankList = [
    { num: 1, label: 'Starter' },
    { num: 2, label: 'Builder' },
    { num: 3, label: 'Grower' },
    { num: 4, label: 'Achiever' },
    { num: 5, label: 'Advancer' },
    { num: 6, label: 'Progressor' },
    { num: 7, label: 'Leader' },
    { num: 8, label: 'Pioneer' },
    { num: 9, label: 'Champion' },
    { num: 10, label: 'Legend' }
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. TOP HEADER NAVIGATION */}
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Unique Income Plan</h2>
            <span className={styles.logoSlogan}>Build • Earn • Grow</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/')}>
            🏠 Back to Website
          </button>
          {user?.role === 'admin' && (
            <button className={styles.adminPortalBtn} onClick={() => router.push('/admin')}>
              🛡️ Admin Panel
            </button>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Sub header welcome bar */}
      <div className={styles.welcomeSubBar}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.welcomeTitle}>Welcome, {user?.full_name}</h1>
          <p className={styles.welcomeSubtitle}>Your professional income dashboard</p>
        </div>
      </div>

      <main className={styles.mainContent}>
        {/* 2. THREE-COLUMN STATUS ROW */}
        <section className={styles.statusRow}>
          <Card className={styles.statusCard}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Status</span>
              <div className={styles.statusValueRow}>
                <span className={styles.statusIndicator}>●</span>
                <span className={styles.statusTextVal}>Professional Pack Active</span>
              </div>
            </div>
            <span className={styles.statusBadge}>Live</span>
          </Card>
          <Card className={styles.statusCard}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Current Rank</span>
              <span className={styles.statusTextVal}>Rank {rankInfo.rank}: {rankInfo.name}</span>
            </div>
            <span className={styles.statusBadge}>$3 Investment</span>
          </Card>
          <Card className={styles.statusCard}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Account Type</span>
              <span className={styles.statusTextVal}>Active</span>
            </div>
            <span className={styles.statusBadge}>From Scratch</span>
          </Card>
        </section>

        {/* 3. FOUR METRICS CARDS GRID */}
        <section className={styles.metricsGrid}>
          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Total Earnings</span>
            </div>
            <h3 className={styles.metricValue}>${totalEarnings.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Direct Income</span>
            </div>
            <h3 className={styles.metricValue}>${directSum.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Level Income</span>
            </div>
            <h3 className={styles.metricValue}>${levelSum.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Team Members</span>
            </div>
            <h3 className={styles.metricValue}>{stats.teamCount}</h3>
          </Card>
        </section>

        {/* 4. DOUBLE GRID: INCOME BREAKDOWN & RANK PROGRESS */}
        <section className={styles.doubleGrid}>
          {/* Left: Income Breakdown progress bars */}
          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Income Breakdown</h4>
            <div className={styles.breakdownList}>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Direct</span>
                  <span>{directPercent}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${directPercent}%` }} />
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Level</span>
                  <span>{levelPercent}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${levelPercent}%` }} />
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Team</span>
                  <span>0%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: '0%' }} />
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Salary</span>
                  <span>0%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: '0%' }} />
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Reward</span>
                  <span>{otherPercent}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${otherPercent}%` }} />
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownLabelRow}>
                  <span>Maintenance</span>
                  <span>0%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Rank Progress step list */}
          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Rank Progress</h4>
            <div className={styles.rankStepper}>
              {rankList.map((r) => {
                const isActive = rankInfo.rank >= r.num;
                const isCurrent = rankInfo.rank === r.num;
                return (
                  <div 
                    key={r.num} 
                    className={`${styles.rankStep} ${isActive ? styles.stepActive : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                  >
                    <div className={styles.stepCircle}>{r.num}</div>
                    <span className={styles.stepLabel}>{r.label}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.rankProgressFooter}>
              <div className={styles.progressPercentRow}>
                <span>Progress: {rankInfo.progress}% to next rank</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${rankInfo.progress}%` }} />
              </div>
            </div>
          </Card>
        </section>

        {/* 5. AUTO-SPILL & WALLET ACTIONS */}
        <section className={styles.doubleGrid}>
          {/* Left: Binary Auto-Spill visualization */}
          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Binary Auto-Spill</h4>
            <div className={styles.binaryTreeBox}>
              <div className={styles.binaryTree}>
                <div className={`${styles.treeNode} ${styles.nodeRoot}`}>
                  <span className={styles.nodeIcon}>👤</span>
                  <span className={styles.nodeTitle}>You</span>
                </div>
                
                <div className={styles.treeBranches}>
                  <div className={styles.branchLineLeft} />
                  <div className={styles.branchLineRight} />
                </div>

                <div className={styles.nodeChildrenRow}>
                  <div className={`${styles.treeNode} ${styles.nodeLeftLeg}`}>
                    <span className={styles.legBadge}>L</span>
                    <span className={styles.legTitle}>Left Leg</span>
                    <span className={styles.legCount}>{leftLegCount} Members</span>
                  </div>

                  <div className={`${styles.treeNode} ${styles.nodeRightLeg}`}>
                    <span className={styles.legBadge}>R</span>
                    <span className={styles.legTitle}>Right Leg</span>
                    <span className={styles.legCount}>{rightLegCount} Members</span>
                  </div>
                </div>
              </div>
              <div className={styles.autoSpillSettings}>
                <span className={styles.autoSpillStatus}>Auto-Spill: <strong className={styles.greenText}>Active</strong></span>
                <span className={styles.autoSpillPlacement}>Placement: <strong>L → R</strong></span>
              </div>
            </div>
          </Card>

          {/* Right: Wallet Balance & Withdrawal Operations */}
          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Wallet Balance</h4>
            <div className={styles.walletBox}>
              <h3 className={styles.mainBalanceDisplay}>${wallet?.main_balance.toFixed(2) || '0.00'}</h3>
              <p className={styles.balanceStatusLabel}>Available for withdrawal</p>
              
              <div className={styles.walletButtonsRow}>
                <Button className={styles.walletBtn} onClick={() => router.push('/dashboard/deposit')}>
                  💸 Deposit
                </Button>
                <Button variant="secondary" className={styles.walletBtn} onClick={() => router.push('/dashboard/withdraw')}>
                  📥 Withdraw
                </Button>
              </div>
            </div>

            {/* Referral Sponsor Link */}
            <div className={styles.referralLinkContainer}>
              <span className={styles.referralLabel}>Your unique link:</span>
              <div className={styles.referralInputRow}>
                <input
                  type="text"
                  readOnly
                  value={user ? `${window.location.origin}/signup?ref=${user.referral_code}` : ''}
                  className={styles.referralInput}
                />
                <button className={styles.referralCopyBtn} onClick={copyReferralLink}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </Card>
        </section>

        {/* 6. LEDGER / TRANSACTION HISTORY */}
        <section className={styles.singleGrid}>
          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Recent Activity</h4>
            {transactions.length === 0 ? (
              <div className={styles.emptyActivity}>
                <p>No activity yet. Start building your network!</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {transactions.map((tx) => (
                  <div key={tx.id} className={styles.activityRow}>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityIcon}>⚡</span>
                      <div className={styles.activityDetails}>
                        <span className={styles.activityTitle}>
                          {tx.type.replace('commission_', 'Earn ').replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={styles.activityDesc}>{tx.description}</span>
                      </div>
                    </div>
                    <div className={styles.activityValueCol}>
                      <span className={tx.amount > 0 ? styles.positiveValue : styles.negativeValue}>
                        {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                      </span>
                      <span className={styles.activityDate}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* 7. DIAGNOSTIC PANEL FOR TROUBLESHOOTING */}
        <section className={styles.singleGrid} style={{ marginTop: '2rem' }}>
          <Card className={styles.panelCard} style={{ border: '1px solid var(--color-primary)' }}>
            <h4 className={styles.panelTitle} style={{ color: 'var(--color-primary)' }}>🛠️ Platform Connection Diagnostic</h4>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: '1.6', color: '#ccc', marginTop: '1rem' }}>
              <p><strong>URL Origin:</strong> {debugInfo.urlOrigin}</p>
              <p><strong>Auth ID:</strong> {debugInfo.authUserId || 'Not authenticated'}</p>
              <p><strong>Auth Email:</strong> {debugInfo.authUserEmail || 'N/A'}</p>
              <hr style={{ borderColor: '#222', margin: '0.5rem 0' }} />
              <p><strong>Profile Table Query:</strong> <span style={{ color: debugInfo.profileStatus?.includes('Error') || debugInfo.profileStatus?.includes('Exception') ? '#e74c3c' : '#2ecc71' }}>{debugInfo.profileStatus}</span></p>
              <p><strong>Wallet Table Query:</strong> <span style={{ color: debugInfo.walletStatus?.includes('Error') || debugInfo.walletStatus?.includes('Exception') ? '#e74c3c' : '#2ecc71' }}>{debugInfo.walletStatus}</span></p>
              <p><strong>Referrals Table Query:</strong> <span style={{ color: debugInfo.referralsStatus?.includes('Error') || debugInfo.referralsStatus?.includes('Exception') ? '#e74c3c' : '#2ecc71' }}>{debugInfo.referralsStatus}</span></p>
              <p><strong>Transactions Table Query:</strong> <span style={{ color: debugInfo.transactionsStatus?.includes('Error') || debugInfo.transactionsStatus?.includes('Exception') ? '#e74c3c' : '#2ecc71' }}>{debugInfo.transactionsStatus}</span></p>
              {debugInfo.errorMsg && (
                <>
                  <hr style={{ borderColor: '#222', margin: '0.5rem 0' }} />
                  <p style={{ color: '#e74c3c' }}><strong>Global Error:</strong> {debugInfo.errorMsg}</p>
                </>
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
