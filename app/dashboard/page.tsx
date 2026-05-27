"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import styles from './dashboard.module.css';
import WalletModal from '../../components/WalletModal';

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

const ranks = [
  { id: 1, name: "Starter", price: 3 },
  { id: 2, name: "Builder", price: 6 },
  { id: 3, name: "Grower", price: 12 },
  { id: 4, name: "Achiever", price: 24 },
  { id: 5, name: "Advancer", price: 48 },
  { id: 6, name: "Progressor", price: 96 },
  { id: 7, name: "Leader", price: 192 },
  { id: 8, name: "Pioneer", price: 384 },
  { id: 9, name: "Champion", price: 768 },
  { id: 10, name: "Legend", price: 1536 },
];

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ referralsCount: 0, teamCount: 0 });
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [directSum, setDirectSum] = useState(0);
  const [levelSum, setLevelSum] = useState(0);
  const [teamSum, setTeamSum] = useState(0);
  const [salarySum, setSalarySum] = useState(0);
  const [rewardSum, setRewardSum] = useState(0);
  const [weeklySalarySum, setWeeklySalarySum] = useState(0);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [communityTree, setCommunityTree] = useState<Array<{id:string; name:string; level:number}>>([]);
  const [myDirectMembers, setMyDirectMembers] = useState<Array<{id:string; name:string}>>([]);
  const [showCommunityTree, setShowCommunityTree] = useState(false);
  const [mobileSliderIndex, setMobileSliderIndex] = useState(-1);
  const [purchasedRank, setPurchasedRank] = useState(0);
  const [achievingRank, setAchievingRank] = useState<number | null>(null);
  const [showLowerRanks, setShowLowerRanks] = useState(false); // Controls visibility of lower ranks

  // Split ranks into always-visible top ranks (up to current) and lower ranks
  const topRanks = ranks.filter(r => r.id <= purchasedRank);

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
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          logs.errorMsg = `Auth error: ${authError?.message || 'No active session'}`;
          setDebugInfo(logs);
          router.push('/signin');
          return;
        }

        logs.authUserId = authUser.id;
        logs.authUserEmail = authUser.email;

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

        try {
          const { data: rankData } = await supabase
            .from('user_ranks')
            .select('rank')
            .eq('user_id', authUser.id)
            .single();
          if (rankData) {
            setPurchasedRank(rankData.rank);
          }
        } catch (e: any) {
        }

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
                const today = new Date().toISOString().split('T')[0];
                const directToday = txData
                  .filter(t => t.type === 'commission_direct' && t.created_at.startsWith(today))
                  .reduce((acc, curr) => acc + Number(curr.amount), 0);
                const lvlToday = txData
                  .filter(t => t.type === 'commission_level' && t.created_at.startsWith(today))
                  .reduce((acc, curr) => acc + Number(curr.amount), 0);
                setDailyIncome(directToday + lvlToday);

                // Fetch direct members for current user
                const { data: directRefs } = await supabase
                  .from('referrals')
                  .select('referred_id')
                  .eq('sponsor_id', authUser.id)
                  .eq('level', 1);
                if (directRefs) {
                  const directIds = directRefs.map(r => r.referred_id);
                  const { data: directUsers } = await supabase
                    .from('users')
                    .select('id, full_name')
                    .in('id', directIds);
                  const directList = directUsers?.map(u => ({ id: u.id, name: u.full_name })) || [];
                  setMyDirectMembers(directList);
                }

                const { data: allRefs } = await supabase
                  .from('referrals')
                  .select('sponsor_id, referred_id, level')
                  .order('level', { ascending: true });
                if (allRefs) {
                  // Compute full team (direct + indirect) hierarchy
                  const computeTeam = (rootId: string, allRefs: any[]) => {
                    const visited = new Set<string>();
                    const stack = [rootId];
                    while (stack.length) {
                      const cur = stack.pop()!;
                      const children = allRefs.filter(r => r.sponsor_id === cur);
                      children.forEach(r => {
                        if (!visited.has(r.referred_id)) {
                          visited.add(r.referred_id);
                          stack.push(r.referred_id);
                        }
                      });
                    }
                    return Array.from(visited);
                  };
                  if (authUser) {
                    const teamIds = computeTeam(authUser.id, allRefs);
                    const { data: teamUsers } = await supabase
                      .from('users')
                      .select('id, full_name')
                      .in('id', teamIds);
                  }

                  const referredIds = allRefs.map(r => r.referred_id);
                  const { data: usersData } = await supabase
                    .from('users')
                    .select('id, full_name')
                    .in('id', referredIds);
                  const userMap: Record<string, string> = {};
                  usersData?.forEach(u => { userMap[u.id] = u.full_name; });
                  const tree = allRefs.map(r => ({
                    id: r.referred_id,
                    name: userMap[r.referred_id] || 'User',
                    level: r.level
                  }));
                  setCommunityTree(tree);
                }
            }
            logs.transactionsStatus = 'Success';
          }
                const { data: aggregateTxData } = await supabase
                  .from('transactions')
                  .select('amount, type, created_at')
                  .eq('user_id', authUser.id)
                  .in('type', ['commission_direct', 'commission_level', 'commission_team', 'commission_salary', 'commission_reward']);
                
                if (aggregateTxData) {
                  const dSum = aggregateTxData
                    .filter(t => t.type === 'commission_direct')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);
                  const lSum = aggregateTxData
                    .filter(t => t.type === 'commission_level')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);
                  const tSum = aggregateTxData
                    .filter(t => t.type === 'commission_team')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);
                  const sSum = aggregateTxData
                    .filter(t => t.type === 'commission_salary')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);
                  const rSum = aggregateTxData
                    .filter(t => t.type === 'commission_reward')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);
                  
                  setDirectSum(dSum);
                  setLevelSum(lSum);
                  setTeamSum(tSum);
                  setSalarySum(sSum);
                  setRewardSum(rSum);
                  
                  const now = new Date();
                  const weekAgo = new Date();
                  weekAgo.setDate(now.getDate() - 6);
                  const weekStart = weekAgo.toISOString().split('T')[0];
                  const weekSalary = aggregateTxData
                    .filter(t => t.type === 'commission_salary' && t.created_at >= weekStart)
                    .reduce((acc, cur) => acc + Number(cur.amount), 0);
                  setWeeklySalarySum(weekSalary);
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

  const baseRankInfo = getRankInfo(stats.referralsCount);
  const effectiveRankNum = Math.max(baseRankInfo.rank, purchasedRank);
  const rankInfo = effectiveRankNum > baseRankInfo.rank 
    ? { 
        rank: effectiveRankNum, 
        name: ranks[effectiveRankNum - 1].name, 
        nextRank: effectiveRankNum < 10 ? ranks[effectiveRankNum].name : 'Max Rank Reached', 
        target: 0, 
        progress: 100 
      }
    : baseRankInfo;
  
  const totalEarnings = (wallet?.income_balance || 0) + (wallet?.withdrawal_balance || 0);
  const currentSliderIndex = mobileSliderIndex === -1 ? Math.max(0, rankInfo.rank - 1) : mobileSliderIndex;

  const handleAchieveRank = async (rank: typeof ranks[0]) => {
    if (!user || !wallet || wallet.main_balance < rank.price) return;
    if (!confirm(`Are you ready to claim your position as ${rank.name}? This will deduct $${rank.price} from your wallet.`)) return;

    setAchievingRank(rank.id);
    try {
      const { error: deductErr } = await supabase
        .from('wallets')
        .update({ main_balance: wallet.main_balance - rank.price })
        .eq('user_id', user.id);
      if (deductErr) throw deductErr;

      const { error: rankErr } = await supabase
        .from('user_ranks')
        .upsert({ user_id: user.id, rank: rank.id });
      if (rankErr) throw rankErr;

      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: -rank.price,
        type: 'rank_purchase',
        description: `Achieved ${rank.name} Rank`,
      });

      // --- PHASE 1 DISTRIBUTION LOGIC: Direct Income (20%) ---
      // We call the secure backend RPC to distribute the 20% commission to the sponsor.
      // This bypasses client-side RLS limits and executes atomically on the server.
      const { error: rpcError } = await supabase.rpc('distribute_investment', { 
        investor_id: user.id, 
        investment_amount: rank.price 
      });
      
      if (rpcError) {
        console.error("Direct Income Distribution Error:", rpcError);
        // Note: Even if distribution fails, we don't necessarily want to reverse the user's rank upgrade, 
        // but we log it for admin review.
      }
      // --- END PHASE 1 DISTRIBUTION ---

      alert(`Congratulations! You are now a ${rank.name}!`);
      window.location.reload();
    } catch (err: any) {
      alert("Error achieving rank: " + err.message);
    } finally {
      setAchievingRank(null);
    }
  };

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
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Unique Income Plane</h2>
            <span className={styles.logoSlogan}>Build • Earn • Grow</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/')}>
            🏠 Back to Website
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className={styles.welcomeSubBar}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.welcomeTitle}>Welcome, {user?.full_name}</h1>
          <p className={styles.welcomeSubtitle}>Your professional income dashboard</p>
        </div>
      </div>

      <main className={styles.mainContent}>
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
          <Card className={styles.statusCard}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>My Team</span>
              <span className={styles.statusBadge}>{myDirectMembers.length} Direct</span>
            </div>
            {myDirectMembers.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>No direct members yet.</p>
            ) : (
              <button onClick={() => router.push('/dashboard/my-team')} style={{marginTop:'0.4rem',fontSize:'0.7rem',background:'linear-gradient(135deg, #00d2ff, #0080ff)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em'}}>View Tree</button>
            )}
          </Card>

          <Card className={styles.statusCard}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Community Size</span>
              <span className={styles.statusTextVal}>{communityTree.length} members</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginTop:'0.25rem'}}>
              <span className={styles.statusBadge}>All</span>
              <button onClick={() => router.push('/dashboard/community-tree')} style={{fontSize:'0.7rem',background:'linear-gradient(135deg, #00d2ff, #0080ff)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em',whiteSpace:'nowrap'}}>View Tree</button>
            </div>
          </Card>
        </section>

        <section className={styles.metricsGrid}>
          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Total Earnings</span>
            </div>
            <h3 className={styles.metricValue}>${totalEarnings.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Today's Income</span>
            </div>
            <h3 className={styles.metricValue}>${dailyIncome.toFixed(2)}</h3>
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
              <span className={styles.metricTitle}>Team Income</span>
            </div>
            <h3 className={styles.metricValue}>${teamSum.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Weekly Income</span>
            </div>
            <h3 className={styles.metricValue}>${weeklySalarySum.toFixed(2)}</h3>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Reward Income</span>
            </div>
            <h3 className={styles.metricValue}>${rewardSum.toFixed(2)}</h3>
          </Card>
        </section>

        <section className={styles.doubleGrid}>
          <Card className={styles.panelCard}>
            {/* Rank Progress Header with toggle for lower ranks */}
            <div className={styles.rankProgressHeaderRow}>
              <h4 className={styles.panelTitle}>Rank Progress</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className={styles.mobileSliderControls}>
                  <button 
                    className={styles.mobileSliderBtn} 
                    disabled={currentSliderIndex === 0}
                    onClick={() => setMobileSliderIndex(Math.max(0, currentSliderIndex - 1))}
                  >
                    &lt;
                  </button>
                  <button 
                    className={styles.mobileSliderBtn} 
                    disabled={currentSliderIndex === rankList.length - 1}
                    onClick={() => setMobileSliderIndex(Math.min(rankList.length - 1, currentSliderIndex + 1))}
                  >
                    &gt;
                  </button>
                </div>
                <button 
                  className={styles.mobileSliderBtn} 
                  onClick={() => setShowLowerRanks(!showLowerRanks)} 
                  aria-label="Toggle lower ranks"
                >
                  {showLowerRanks ? '🔼' : '🔽'}
                </button>
              </div>
            </div>

            {/* Always show progress stepper */}
            <div className={styles.rankStepper}>
              {rankList.map((r, i) => {
                const isActive = rankInfo.rank >= r.num;
                const isCurrent = rankInfo.rank === r.num;
                const isMobileVisible = currentSliderIndex === i;
                return (
                  <div 
                    key={r.num} 
                    className={`${styles.rankStep} ${isActive ? styles.stepActive : ''} ${isCurrent ? styles.stepCurrent : ''} ${isMobileVisible ? styles.mobileVisible : styles.mobileHidden}`}
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

            {showLowerRanks && (
              <div style={{ marginTop: '2rem' }}>
                <h4 className={styles.subSectionTitle}>Achieve New Ranks</h4>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {ranks.map((rank) => (
                    <div key={rank.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: (rank.id <= rankInfo.rank) ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.02)',
                      border: (rank.id <= rankInfo.rank) ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                    }}>
                      <div>
                        <h4 style={{ fontWeight: 700, margin: 0, color: (rank.id <= rankInfo.rank) ? '#2ecc71' : '#fff' }}>{rank.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: '#00d2ff', fontWeight: 600 }}>${rank.price}</span>
                      </div>
                      {(rank.id <= rankInfo.rank) ? (
                        <span style={{ color: '#2ecc71', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Achieved</span>
                      ) : (
                        <button disabled={!((wallet?.main_balance || 0) >= rank.price) || achievingRank === rank.id} onClick={() => handleAchieveRank(rank)} style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          background: ((wallet?.main_balance || 0) >= rank.price) ? 'linear-gradient(135deg, #00d2ff, #0080ff)' : 'rgba(255,255,255,0.05)',
                          color: ((wallet?.main_balance || 0) >= rank.price) ? '#fff' : 'rgba(255,255,255,0.3)',
                          border: 'none',
                          cursor: ((wallet?.main_balance || 0) >= rank.price) ? 'pointer' : 'not-allowed',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          boxShadow: ((wallet?.main_balance || 0) >= rank.price) ? '0 4px 15px rgba(0,210,255,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}>{achievingRank === rank.id ? 'Processing...' : (((wallet?.main_balance || 0) >= rank.price) ? 'Achieve Rank' : 'Insufficient Balance')}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className={styles.panelCard}>
            <h4 className={styles.panelTitle}>Wallet Balance</h4>
            <div className={styles.walletBox}>
              <h3 className={styles.mainBalanceDisplay}>${wallet?.main_balance.toFixed(2) || '0.00'}</h3>
              <p className={styles.balanceStatusLabel}>Available for withdrawal</p>
              
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.25rem',
                width: '100%',
              }}>
                <button
                  onClick={() => setShowDepositModal(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00d2ff, #0080ff)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '0.03em',
                    boxShadow: '0 4px 18px rgba(0, 210, 255, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,210,255,0.45)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(0, 210, 255, 0.3)'; }}
                >
                  💸 Deposit
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ffaa00, #ff6600)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '0.03em',
                    boxShadow: '0 4px 18px rgba(255, 170, 0, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(255,170,0,0.45)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(255, 170, 0, 0.3)'; }}
                >
                  📥 Withdraw
                </button>
              </div>
            </div>
            </Card>
            {showDepositModal && (
              <WalletModal type="deposit" open={showDepositModal} onClose={() => setShowDepositModal(false)} />
            )}
            {showWithdrawModal && (
              <WalletModal type="withdraw" open={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
            )}

            <div className={styles.referralLinkContainer}>
              <span className={styles.referralLabel}>Your unique link:</span>
              <div className={styles.referralInputRow}>
                <input
                  type="text"
                  readOnly
                  value={user ? `${window.location.origin}/signup?ref=${user.referral_code}` : ''}
                  className={styles.referralInput} />
                <button className={styles.referralCopyBtn} onClick={copyReferralLink}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>



          

        </section>

            {/* 6. Community Size Section */}
            {/* Community Size moved to top status cards */}

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


      </main>
    </div>
  );
}
