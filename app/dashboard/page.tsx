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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get logged-in user session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // 2. Fetch public user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, full_name, email, referral_code, role')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        setUser(profile);

        // 3. Fetch user wallet balances
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('main_balance, deposit_balance, income_balance, withdrawal_balance')
          .eq('user_id', authUser.id)
          .single();

        if (walletError) throw walletError;
        setWallet(walletData);

        // 4. Fetch referrals count
        const { count: referralsCount, error: refError } = await supabase
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', authUser.id);

        // 5. Fetch recent transactions
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('id, amount, type, description, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!txError && txData) {
          setTransactions(txData);
        }

        setStats({
          referralsCount: referralsCount || 0,
          teamCount: (referralsCount || 0) * 3, // Multi-tier mock for downline tracking
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
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

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. TOP HEADER NAVIGATION */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoBadge}>UIP</span>
          <h2 className={styles.logoText}>Dashboard</h2>
        </div>
        <div className={styles.profileHeader}>
          <span className={styles.welcomeText}>Welcome, <strong>{user?.full_name}</strong></span>
          {user?.role === 'admin' && (
            <button className={styles.adminPortalBtn} onClick={() => router.push('/admin')}>
              🛡️ Admin Panel
            </button>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* 2. CORE WALLET BALANCES SECTION */}
        <section className={styles.walletSection}>
          <Card className={styles.walletCard}>
            <div className={styles.cardHeader}>
              <span>Main Wallet</span>
              <h3 className={styles.goldText}>${wallet?.main_balance.toFixed(2)}</h3>
            </div>
          </Card>
          <Card className={styles.walletCard}>
            <div className={styles.cardHeader}>
              <span>Deposit Wallet</span>
              <h3>${wallet?.deposit_balance.toFixed(2)}</h3>
            </div>
          </Card>
          <Card className={styles.walletCard}>
            <div className={styles.cardHeader}>
              <span>Income Wallet</span>
              <h3>${wallet?.income_balance.toFixed(2)}</h3>
            </div>
          </Card>
          <Card className={styles.walletCard}>
            <div className={styles.cardHeader}>
              <span>Withdrawal Wallet</span>
              <h3>${wallet?.withdrawal_balance.toFixed(2)}</h3>
            </div>
          </Card>
        </section>

        {/* 3. DOUBLE PANELS (REFERRAL & QUICK ACTIONS / RECENT TRANSACTIONS) */}
        <section className={styles.detailsGrid}>
          {/* Left Side: Referral Program & Quick Actions */}
          <div className={styles.leftColumn}>
            <Card className={styles.referralCard}>
              <h4 className={styles.panelTitle}>Referral Network</h4>
              <div className={styles.referralLinkBox}>
                <p className={styles.boxLabel}>Your Unique Sponsor Link</p>
                <div className={styles.linkRow}>
                  <input
                    type="text"
                    readOnly
                    value={user ? `${window.location.origin}/signup?ref=${user.referral_code}` : ''}
                    className={styles.linkInput}
                  />
                  <button className={styles.copyBtn} onClick={copyReferralLink}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className={styles.networkStats}>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>{stats.referralsCount}</span>
                  <span className={styles.statLabel}>Direct Downline</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>{stats.teamCount}</span>
                  <span className={styles.statLabel}>Total Team Members</span>
                </div>
              </div>
            </Card>

            <Card className={styles.quickActionsCard}>
              <h4 className={styles.panelTitle}>Financial Actions</h4>
              <div className={styles.actionButtons}>
                <Button className={styles.actionBtn} onClick={() => router.push('/dashboard/deposit')}>
                  💸 Make Deposit
                </Button>
                <Button variant="secondary" className={styles.actionBtn} onClick={() => router.push('/dashboard/withdraw')}>
                  📥 Request Withdrawal
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Side: Ledger Transaction History */}
          <div className={styles.rightColumn}>
            <Card className={styles.ledgerCard}>
              <h4 className={styles.panelTitle}>Recent Ledger Transactions</h4>
              {transactions.length === 0 ? (
                <div className={styles.emptyLedger}>
                  <p>No transactions registered yet.</p>
                  <span className={styles.helperText}>Make a deposit or share your sponsor link to start earning!</span>
                </div>
              ) : (
                <div className={styles.transactionList}>
                  {transactions.map((tx) => (
                    <div key={tx.id} className={styles.txRow}>
                      <div className={styles.txMeta}>
                        <span className={styles.txType}>{tx.type.replace('commission_', 'earn ').replace('_', ' ')}</span>
                        <span className={styles.txDesc}>{tx.description}</span>
                      </div>
                      <div className={styles.txValueCol}>
                        <span className={tx.amount > 0 ? styles.positiveAmt : styles.negativeAmt}>
                          {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                        </span>
                        <span className={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
