"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import {
  Users,
  CreditCard,
  ArrowDownCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import styles from "./admin.module.css";

// Dummy data for charts while waiting for real data
const revenueData = [
  { name: "Mon", deposit: 4000, withdraw: 2400 },
  { name: "Tue", deposit: 3000, withdraw: 1398 },
  { name: "Wed", deposit: 2000, withdraw: 9800 },
  { name: "Thu", deposit: 2780, withdraw: 3908 },
  { name: "Fri", deposit: 1890, withdraw: 4800 },
  { name: "Sat", deposit: 2390, withdraw: 3800 },
  { name: "Sun", deposit: 3490, withdraw: 4300 },
];

const rankData = [
  { name: "R1", users: 120 },
  { name: "R2", users: 98 },
  { name: "R3", users: 86 },
  { name: "R4", users: 45 },
  { name: "R5", users: 30 },
  { name: "R6", users: 15 },
  { name: "R7", users: 5 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user count using direct supabase (count needed)
  useEffect(() => {
    async function fetchUserCount() {
      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      setStats((prev) => ({ ...prev, totalUsers: userCount || 0 }));
    }
    fetchUserCount();
  }, [supabase]);

  // Fetch deposits and withdrawals using useSupabaseQuery hook
  const { data: deposits } = useSupabaseQuery<any>("payments", { select: "amount", role: "anon" }, { eq: ["status", "completed"] });
  const { data: withdrawals } = useSupabaseQuery<any>("withdrawals", { select: "amount", role: "anon" }, { eq: ["status", "completed"] });

  const depositSum = deposits?.reduce((acc, cur) => acc + cur.amount, 0) || 0;
  const withdrawalSum = withdrawals?.reduce((acc, cur) => acc + cur.amount, 0) || 0;

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      totalDeposits: depositSum,
      totalWithdrawals: withdrawalSum,
      totalEarnings: depositSum * 0.15,
    }));
  }, [depositSum, withdrawalSum]);

  return (
    <div>
      {/* Overview Metrics */}
      <div className={styles.metricGrid}>
        <div className={styles.glassCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Total Users</span>
              <div className={styles.metricIcon}>
                <Users size={18} />
              </div>
            </div>
            <h3 className={styles.metricValue}>{stats.totalUsers}</h3>
            <div className={styles.metricTrend}>
              <span className={styles.trendPositive}>+12.5%</span>
              <span className={styles.trendSubtitle}>from last month</span>
            </div>
          </div>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Total Deposits</span>
              <div className={styles.metricIcon}>
                <ArrowDownCircle size={18} />
              </div>
            </div>
            <h3 className={styles.metricValue}>${stats.totalDeposits.toFixed(2)}</h3>
            <div className={styles.metricTrend}>
              <span className={styles.trendPositive}>+8.2%</span>
              <span className={styles.trendSubtitle}>from last month</span>
            </div>
          </div>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Total Withdrawals</span>
              <div className={styles.metricIcon}>
                <CreditCard size={18} />
              </div>
            </div>
            <h3 className={styles.metricValue}>${stats.totalWithdrawals.toFixed(2)}</h3>
            <div className={styles.metricTrend}>
              <span className={styles.trendNegative}>-2.4%</span>
              <span className={styles.trendSubtitle}>from last month</span>
            </div>
          </div>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Platform Earnings</span>
              <div className={styles.metricIcon}>
                <TrendingUp size={18} />
              </div>
            </div>
            <h3 className={styles.metricValue}>${stats.totalEarnings.toFixed(2)}</h3>
            <div className={styles.metricTrend}>
              <span className={styles.trendPositive}>+15.3%</span>
              <span className={styles.trendSubtitle}>from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.bentoGrid}>
        <div className={styles.glassCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Revenue Overview (Last 7 Days)</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7E67" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF7E67" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#120d1d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="deposit" stroke="#4ade80" fillOpacity={1} fill="url(#colorDeposit)" />
                <Area type="monotone" dataKey="withdraw" stroke="#FF7E67" fillOpacity={1} fill="url(#colorWithdraw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Rank Distribution</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#120d1d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="users" fill="#FFC371" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
