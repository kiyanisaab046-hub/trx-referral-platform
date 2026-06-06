"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Card } from '../../components/Card';


import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import styles from './dashboard.module.css';
import WalletModal from '../../components/WalletModal';
import { MemberModal } from '../../components/MemberModal';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  role: string;
  numeric_id: string | null;
  activation_date: string | null;
  sponsor_id: string | null;
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

  // Track current day for daily income reset
  const [currentDay, setCurrentDay] = useState(() => new Date().toISOString().split('T')[0]);

  // Update currentDay at midnight (or every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const newDay = new Date().toISOString().split('T')[0];
      setCurrentDay((prev) => (prev !== newDay ? newDay : prev));
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);

  // Function to copy referral link to clipboard
  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/signup?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy referral link:', err);
    });
  };

const directSum = useMemo(() => Math.max(0, transactions.filter(t => t.type === 'commission_direct' && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0)), [transactions]);
const levelSum = useMemo(() => Math.max(0, transactions.filter(t => t.type === 'commission_level' && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0)), [transactions]);
const teamSum = useMemo(() => Math.max(0, transactions.filter(t => t.type === 'commission_team' && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0)), [transactions]);
const salarySum = useMemo(() => Math.max(0, transactions.filter(t => t.type === 'commission_salary' && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0)), [transactions]);
const rewardSum = useMemo(() => Math.max(0, transactions.filter(t => t.type === 'commission_reward' && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0)), [transactions]);
const [teamBusiness, setTeamBusiness] = useState(0);
const weeklySalarySum = useMemo(() => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);
  const weekStart = weekAgo.toISOString().split('T')[0];
  return Math.max(0, transactions.filter(t => t.type === 'commission_salary' && t.created_at >= weekStart && Number(t.amount) > 0).reduce((acc, cur) => acc + Number(cur.amount), 0));
}, [transactions]);
          const dailyIncome = useMemo(() => {
            const today = new Date().toISOString().split('T')[0];
            const incomeTypes = [
              'commission_direct',
              'commission_level',
              'commission_team',
              'commission_salary',
              'commission_reward',
              'commission_maintenance'
            ];
            return Math.max(0, transactions
              .filter(t => t.created_at.startsWith(today) && incomeTypes.includes(t.type) && Number(t.amount) > 0)
              .reduce((a, c) => a + Number(c.amount), 0));
          }, [transactions]);

  const [communityTree, setCommunityTree] = useState<Array<{id:string; name:string; level:number}>>([]);
  const [myDirectMembers, setMyDirectMembers] = useState<Array<{id:string; name:string}>>([]);
  const [showCommunityTree, setShowCommunityTree] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{id:string; name:string} | null>(null);
  const [mobileSliderIndex, setMobileSliderIndex] = useState(-1);
  const [purchasedRank, setPurchasedRank] = useState(0);
  const [achievingRank, setAchievingRank] = useState<number | null>(null);
  const [showLowerRanks, setShowLowerRanks] = useState(false); // Controls visibility of lower ranks
  const [sponsorNumericId, setSponsorNumericId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Split ranks into always-visible top ranks (up to current) and lower ranks
const [authUserId, setAuthUserId] = useState<string | null>(null);
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

  // Fetch data on mount
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
    setAuthUserId(authUser.id);
        logs.authUserEmail = authUser.email;

        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            logs.profileStatus = `Error: ${profileError.message} (Code: ${profileError.code})`;
            console.error("Profile fetch error:", profileError);
            alert(`Profile Fetch Error: ${profileError.message}`);
          } else if (!profile) {
            logs.profileStatus = 'Error: Profile is null/empty';
            alert('Error: Profile is empty.');
          } else {
            setUser(profile);
            logs.profileStatus = `Success (Ref code: ${profile.referral_code})`;
            // Fetch sponsor's numeric_id if sponsor exists
            if (profile.sponsor_id) {
              const { data: sponsorData } = await supabase
                .from('users')
                .select('*')
                .eq('id', profile.sponsor_id)
                .single();
              if (sponsorData) {
                setSponsorNumericId(sponsorData.numeric_id || sponsorData.referral_code || null);
              }
            }
          }
        } catch (e: any) {
          logs.profileStatus = `Exception: ${e.message || e}`;
          alert(`Profile catch error: ${e.message}`);
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
            .rpc('get_matrix_team_size', { user_uuid: authUser.id });

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
            .order('created_at', { ascending: false });

          if (txError) {
            logs.transactionsStatus = `Error: ${txError.message} (Code: ${txError.code})`;
          } else {
            let combinedTx = txData ? [...txData] as Transaction[] : [];
            
            // Fetch withdrawals
            const { data: withdrawalsData } = await supabase
              .from('withdrawals')
              .select('id, amount, status, created_at')
              .eq('user_id', authUser.id)
              .order('created_at', { ascending: false })
              .limit(10);
              
            if (withdrawalsData) {
              const mappedWithdrawals: Transaction[] = withdrawalsData.map(w => ({
                id: w.id,
                amount: -Number(w.amount),
                type: 'withdrawal',
                description: `Withdrawal (${w.status})`,
                created_at: w.created_at
              }));
              combinedTx = [...combinedTx, ...mappedWithdrawals];
            }
            
            // Sort by created_at desc and take top 10
            combinedTx.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setTransactions(combinedTx);

            if (txData) {
              // Redundant daily income calculation removed; dailyIncome is derived via useMemo

                // Fetch direct members for current user (from referrals table)
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

                // Build community tree from BINARY TREE (left_child_id/right_child_id)
                // This includes both direct referrals AND spillover users
                const { data: allUsersForTree } = await supabase
                  .from('users')
                  .select('id, full_name, left_child_id, right_child_id');

                if (allUsersForTree) {
                  const usersMapBT: Record<string, any> = {};
                  allUsersForTree.forEach(u => { usersMapBT[u.id] = u; });

                  // BFS through binary tree to find all downline
                  const visited = new Set<string>();
                  const bfsQueue = [authUser.id];
                  visited.add(authUser.id);
                  let levelNum = 0;
                  const treeMembers: Array<{id: string; name: string; level: number}> = [];

                  while (bfsQueue.length > 0) {
                    const levelSize = bfsQueue.length;
                    levelNum++;
                    for (let i = 0; i < levelSize; i++) {
                      const cur = bfsQueue.shift()!;
                      const userData = usersMapBT[cur];
                      if (!userData) continue;

                      const children = [userData.left_child_id, userData.right_child_id].filter(Boolean);
                      for (const childId of children) {
                        if (childId && !visited.has(childId)) {
                          visited.add(childId);
                          bfsQueue.push(childId);
                          treeMembers.push({
                            id: childId,
                            name: usersMapBT[childId]?.full_name || 'User',
                            level: levelNum
                          });
                        }
                      }
                    }
                  }

                  setCommunityTree(treeMembers);

                  // Fetch Team Business using secure server-side RPC (bypasses RLS)
                  const { data: businessData, error: businessError } = await supabase
                    .rpc('get_team_business', { root_user_id: authUser.id });
                    
                  if (businessError) {
                    console.error("Team Business Fetch Error:", businessError);
                  } else {
                    setTeamBusiness(Number(businessData) || 0);
                  }
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
                  
                  // Salary and Reward sums are derived via useMemo; no state updates needed
                  
                  const now = new Date();
                  const weekAgo = new Date();
                  weekAgo.setDate(now.getDate() - 6);
                  const weekStart = weekAgo.toISOString().split('T')[0];
                  const weekSalary = aggregateTxData
                    .filter(t => t.type === 'commission_salary' && t.created_at >= weekStart)
                    .reduce((acc, cur) => acc + Number(cur.amount), 0);
                  // weeklySalarySum now derived via useMemo
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

  // Real-time subscription for new transactions
  useEffect(() => {
    if (!authUserId) return;
    const channel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${authUserId}` },
        (payload) => {
          setTransactions((prev) => [payload.new as Transaction, ...prev] as Transaction[]);
          // Refresh team business if needed
          supabase
            .rpc('get_team_business', { root_user_id: authUserId })
            .then((res) => {
              if (!res.error) setTeamBusiness(Number(res.data) || 0);
            });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUserId, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };



  const getRankInfo = (referrals: number, currentPurchased: number) => {
    if (currentPurchased === 0) return { rank: 0, name: 'Unranked', nextRank: 'Starter', target: 0, progress: 0 };
    
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

  const baseRankInfo = getRankInfo(stats.referralsCount, purchasedRank);
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
  
  const totalEarnings = Math.max(0, directSum + levelSum + teamSum + salarySum + rewardSum);
  const currentSliderIndex = mobileSliderIndex === -1 ? Math.max(0, rankInfo.rank - 1) : mobileSliderIndex;

  const handleAchieveRank = async (rank: typeof ranks[0]) => {
    if (!user) {
      alert('Error: User profile not loaded. Please refresh the page.');
      return;
    }
    if (!wallet) {
      alert('Error: Wallet not loaded. Please refresh the page.');
      return;
    }
    if (wallet.main_balance < rank.price) {
      alert(`Insufficient balance! You need $${rank.price} but only have $${wallet.main_balance.toFixed(2)}. Please deposit funds first.`);
      return;
    }
    
    // Prevent skipping ranks
    // Enforce step‑by‑step rank purchases based solely on the user's current purchased rank.
    const nextAllowedRank = purchasedRank + 1;
    if (rank.id > nextAllowedRank) {
      alert(`You must purchase ranks sequentially. The next rank you can acquire is Rank ${nextAllowedRank}.`);
      return;
    }

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

      const { error: txErr } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: -rank.price,
        type: 'rank_purchase',
        description: `Rank Purchase: Achieved ${rank.name} Rank ($${rank.price})`,
      });
      
      if (txErr) {
        console.error("Failed to log rank transaction:", txErr);
        // Don't block rank achievement for a logging error
      }

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

      // --- PHASE 2 DISTRIBUTION LOGIC: Level Income (30%) ---
      const { error: levelError } = await supabase.rpc('distribute_level_income', { 
        upgrader_id: user.id, 
        new_rank_id: rank.id,
        total_upgrade_fee: rank.price 
      });

      if (levelError) {
        console.error("Level Income Distribution Error:", levelError);
      }
      // --- END PHASE 2 DISTRIBUTION ---

      // --- PHASE 3 DISTRIBUTION LOGIC: Team Income (20%) ---
      const { error: teamDistError } = await supabase.rpc('distribute_team_income', { 
        upgrader_id: user.id, 
        new_rank_id: rank.id,
        total_upgrade_fee: rank.price 
      });

      if (teamDistError) {
        console.error("Team Income Distribution Error:", teamDistError);
        alert("Team Income Error: " + teamDistError.message);
      } else {
        console.log("Team Income Distribution: SUCCESS");
      }
      // --- END PHASE 3 DISTRIBUTION ---

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
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Unique Income Plane</h2>
            <span className={styles.logoSlogan}>Build • Earn • Grow</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard/matrix-tree')}>
            🌳 Tree
          </button>
          <button className={styles.homeBtn} onClick={() => router.push('/')}>
            🏠 Back to Website
          </button>
          <button className={styles.logoutBtnDesktop} onClick={handleLogout}>Logout</button>
        </div>
        {/* Mobile Hamburger Button */}
        <button
          className={styles.mobileHamburger}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerLineTop : ''}`} />
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerLineMid : ''}`} />
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerLineBot : ''}`} />
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.mobileDrawerItem} onClick={() => { router.push('/dashboard/weekly-salary'); setMobileMenuOpen(false); }}>
              📅 Weekly Income
            </button>
            <button className={styles.mobileDrawerItem} onClick={() => { router.push('/dashboard/reward-details'); setMobileMenuOpen(false); }}>
              🎁 Reward Details
            </button>
            <button
              className={styles.mobileDrawerItem}
              onClick={() => { router.push('/dashboard/matrix-tree'); setMobileMenuOpen(false); }}
            >
              🌳 Tree
            </button>
            <button className={styles.mobileDrawerItem} onClick={() => { router.push('/dashboard/my-team'); setMobileMenuOpen(false); }}>
              👥 My Team
            </button>
            <button className={styles.mobileDrawerItem} onClick={() => { router.push('/dashboard/community'); setMobileMenuOpen(false); }}>
              ℹ️ Community
            </button>
            <button className={styles.mobileDrawerItem} onClick={() => { router.push('/'); setMobileMenuOpen(false); }}>
              🏠 Back to Website
            </button>
            <button className={`${styles.mobileDrawerItem} ${styles.mobileDrawerLogout}`} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <div className={styles.welcomeSubBar}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.welcomeTitle}>Welcome, {user?.full_name}</h1>
          <p className={styles.welcomeSubtitle}>Your professional income dashboard</p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className={styles.profileDetailsCard}>
        <h4 className={styles.profileDetailsTitle}>👤 Profile Details</h4>
        <div className={styles.profileFieldsGrid}>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>User ID:</span>
            <div className={styles.profileFieldValue}>{user?.numeric_id || user?.referral_code || '—'}</div>
          </div>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Rank:</span>
            <div className={styles.profileFieldValue}>
              <span className={styles.profileRankBadge}>{rankInfo.name.toUpperCase()}</span>
            </div>
          </div>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Activation Date:</span>
            <div className={styles.profileFieldValue}>
              {(user?.activation_date || user?.sponsor_id)
                ? new Date(user?.activation_date || new Date()).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })
                : 'Not Activated'}
            </div>
          </div>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Referred By:</span>
            <div className={styles.profileFieldValue}>{sponsorNumericId || (user?.sponsor_id ? 'Loading...' : 'Direct Signup')}</div>
          </div>
        </div>
      </div>

      <main className={styles.mainContent}>
        <section className={styles.statusRow}>


          <Card className={`${styles.statusCard} ${styles.hideOnMobile}`}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Total Direct Members</span>
              <span className={styles.statusTextVal}>{myDirectMembers.length}</span>
            </div>
          </Card>

          <Card className={`${styles.statusCard} ${styles.hideOnMobile}`}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Community</span>
              <span className={styles.statusTextVal}>{communityTree.length} total</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginTop:'0.25rem'}}>
              <span className={styles.statusBadge}>All Members</span>
              <button onClick={() => router.push('/dashboard/community')} style={{fontSize:'0.7rem',background:'linear-gradient(135deg, #9b59b6, #8e44ad)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em',whiteSpace:'nowrap'}}>View All</button>
            </div>
          </Card>

          <Card className={`${styles.statusCard} ${styles.hideOnMobile}`}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Weekly Income Distribution</span>
              <span className={styles.statusTextVal}>${weeklySalarySum.toFixed(2)}</span>
            </div>
            <button onClick={() => router.push('/dashboard/weekly-salary')} style={{fontSize:'0.7rem',background:'linear-gradient(135deg, #00d2ff, #0080ff)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em',whiteSpace:'nowrap'}}>Detail</button>
          </Card>

          <Card className={`${styles.statusCard} ${styles.hideOnMobile}`}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Reward Details</span>
              <span className={styles.statusTextVal}>${rewardSum.toFixed(2)}</span>
            </div>
            <button onClick={() => router.push('/dashboard/reward-details')} style={{fontSize:'0.7rem',background:'linear-gradient(135deg, #9b59b6, #8e44ad)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em',whiteSpace:'nowrap'}}>Detail</button>
          </Card>

          <Card className={`${styles.statusCard} ${styles.hideOnMobile}`}>
            <div className={styles.statusMeta}>
              <span className={styles.statusLabel}>Binary Tree</span>
              <span className={styles.statusTextVal}>Spillover Network</span>
            </div>
            <button onClick={() => router.push('/dashboard/matrix-tree')} style={{fontSize:'0.7rem',background:'linear-gradient(135deg, #00d2ff, #0080ff)',border:'none',borderRadius:'4px',padding:'3px 8px',color:'#fff',cursor:'pointer',fontWeight:600,letterSpacing:'0.02em',whiteSpace:'nowrap'}}>View Tree</button>
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

          <Card className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>TB</span>
            </div>
            <h3 className={styles.metricValue}>${teamBusiness.toFixed(2)}</h3>
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
                  {ranks.filter(rank => rank.id <= rankInfo.rank + 1).map((rank) => (
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

          <div>
            <Card className={styles.panelCard} style={{ marginBottom: '1.5rem' }}>
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

            {purchasedRank > 0 ? (
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
            ) : (
              <div className={styles.referralLinkContainer} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span className={styles.referralLabel}>Referral Link Unavailable</span>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                  Upgrade your account by purchasing the first rank to activate your referral link and start building your team.
                </p>
              </div>
            )}
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


      {selectedMember && <MemberModal memberId={selectedMember.id} memberName={selectedMember.name} onClose={() => setSelectedMember(null)} />}

    </main>
    </div>
  );
}
