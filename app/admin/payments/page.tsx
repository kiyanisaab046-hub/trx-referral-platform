"use client";
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { CheckCircle, XCircle, ArrowDownCircle, CreditCard, RefreshCw, MoreVertical, Eye, Bell, Check, CheckCheck } from "lucide-react";
import Image from "next/image";
import styles from "../admin.module.css";

const METHOD_COLORS: Record<string, string> = {
  easypaisa: '#2ecc71',
  jazzcash: '#e74c3c',
  sadapay: '#8e44ad',
  nbp: '#3498db',
  crypto: '#00d2ff',
  manual: '#FFC371',
};

interface AdminNotification {
  id: string;
  type: 'deposit' | 'withdrawal';
  title: string;
  message: string;
  user_id: string;
  amount: number;
  is_read: boolean;
  created_at: string;
}

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<any | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ---- FETCH NOTIFICATIONS ----
  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setNotifications(data);
  }, [supabase]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("admin_notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);

    // Fetch ALL pending manual deposits (easypaisa, jazzcash, sadapay, manual)
    const { data: depData } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .in("payment_method", ["easypaisa", "jazzcash", "sadapay", "nbp", "manual"])
      .order("created_at", { ascending: false });

    if (depData) {
      // Fetch user info for each deposit
      const userIds = [...new Set(depData.map((d: any) => d.user_id))];
      const { data: usersData } = await supabase.from("users").select("id, name, email").in("id", userIds.length ? userIds : ['none']);
      const usersMap: Record<string, any> = {};
      usersData?.forEach((u: any) => { usersMap[u.id] = u; });
      const enriched = depData.map((d: any) => ({ ...d, user: usersMap[d.user_id] || null }));
      setDeposits(enriched);
    }

    // Fetch ALL pending withdrawals
    const { data: withData } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (withData) {
      const userIds = [...new Set(withData.map((w: any) => w.user_id))];
      const { data: usersData } = await supabase.from("users").select("id, name, email").in("id", userIds.length ? userIds : ['none']);
      const usersMap: Record<string, any> = {};
      usersData?.forEach((u: any) => { usersMap[u.id] = u; });
      const enriched = withData.map((w: any) => ({ ...w, user: usersMap[w.user_id] || null }));
      setWithdrawals(enriched);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPayments();
    fetchNotifications();

    // Real-time: listen for new deposits
    const depChannel = supabase
      .channel('admin-deposits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    // Real-time: listen for new withdrawals
    const withChannel = supabase
      .channel('admin-withdrawals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdrawals' }, () => {
        fetchPayments();
      })
      .subscribe();

    // Real-time: listen for new admin notifications
    const notifChannel = supabase
      .channel('admin-notifications-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, (payload: any) => {
        const newNotif = payload.new as AdminNotification;
        setNotifications(prev => [newNotif, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(depChannel);
      supabase.removeChannel(withChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [fetchPayments, fetchNotifications, supabase]);

  // ---- DEPOSIT ACTIONS ----
  const handleApproveDeposit = async (paymentId: string, userId: string, amount: number) => {
    if (!confirm(`Approve this deposit of $${amount.toFixed(2)} and credit the user's wallet?`)) return;
    setActionLoading(paymentId);

    // 1. Mark payment as completed
    await supabase.from("payments").update({ status: "completed" }).eq("id", paymentId);

    // 2. Credit user wallet
    const { data: wallet, error: selectErr } = await supabase.from("wallets").select("main_balance").eq("user_id", userId).single();
    
    if (wallet) {
      const { error: updateErr } = await supabase.from("wallets").update({ main_balance: (wallet.main_balance || 0) + amount }).eq("user_id", userId);
      if (updateErr) {
        alert("Failed to update wallet: " + updateErr.message);
        console.error("Update error:", updateErr);
      }
    } else {
      const { error: insertErr } = await supabase.from("wallets").insert({ user_id: userId, main_balance: amount, deposit_balance: 0, income_balance: 0, withdrawal_balance: 0 });
      if (insertErr) {
        alert("Failed to insert wallet: " + insertErr.message);
        console.error("Insert error:", insertErr);
      }
    }

    setActionLoading(null);
    fetchPayments();
  };

  const handleRejectDeposit = async (paymentId: string) => {
    if (!confirm("Reject this deposit request?")) return;
    setActionLoading(paymentId);
    await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
    setActionLoading(null);
    fetchPayments();
  };

  // ---- WITHDRAWAL ACTIONS ----
  const handleApproveWithdrawal = async (withdrawId: string) => {
    if (!confirm("Mark this withdrawal as paid/completed?")) return;
    setActionLoading(withdrawId);
    await supabase.from("withdrawals").update({ status: "completed" }).eq("id", withdrawId);
    setActionLoading(null);
    fetchPayments();
  };

  const handleRejectWithdrawal = async (withdrawId: string, userId: string, amount: number) => {
    if (!confirm(`Reject this withdrawal and refund $${amount.toFixed(2)} back to the user?`)) return;
    setActionLoading(withdrawId);

    // 1. Mark as rejected
    await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", withdrawId);

    // 2. Refund wallet
    const { data: wallet } = await supabase.from("wallets").select("main_balance").eq("user_id", userId).single();
    if (wallet) {
      await supabase.from("wallets").update({ main_balance: wallet.main_balance + amount }).eq("user_id", userId);
    }

    setActionLoading(null);
    fetchPayments();
  };

  const getMethodBadge = (method: string) => {
    const color = METHOD_COLORS[method] || '#FFC371';
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '0.7rem',
        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
        background: `${color}20`, border: `1px solid ${color}40`, color
      }}>
        {method}
      </span>
    );
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      {/* ====== NOTIFICATION CENTER ====== */}
      <div ref={notifRef} style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {/* Bell Button */}
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          style={{
            position: 'relative',
            background: notifOpen ? 'rgba(255, 126, 103, 0.15)' : 'rgba(255,255,255,0.04)',
            border: notifOpen ? '1px solid rgba(255, 126, 103, 0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            cursor: 'pointer',
            color: notifOpen ? '#FF7E67' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Bell size={18} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, #FF7E67, #ff4757)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 900,
              minWidth: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(255, 71, 87, 0.5)',
              animation: 'pulse 2s infinite',
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown Panel */}
        {notifOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '420px',
            maxHeight: '520px',
            background: '#12101c',
            border: '1px solid rgba(255, 126, 103, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>Notifications</h3>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                    color: '#4ade80',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '420px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem' }}>They&apos;ll appear here when users submit requests</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '0.9rem 1.25rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: notif.is_read ? 'transparent' : 'rgba(255, 126, 103, 0.04)',
                      cursor: notif.is_read ? 'default' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => { if (!notif.is_read) e.currentTarget.style.background = 'rgba(255, 126, 103, 0.08)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(255, 126, 103, 0.04)'; }}
                  >
                    {/* Icon */}
                    <div style={{
                      flexShrink: 0,
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: notif.type === 'deposit'
                        ? 'rgba(255, 195, 113, 0.12)'
                        : 'rgba(74, 222, 128, 0.12)',
                      border: `1px solid ${notif.type === 'deposit' ? 'rgba(255, 195, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)'}`,
                    }}>
                      {notif.type === 'deposit'
                        ? <ArrowDownCircle size={16} style={{ color: '#FFC371' }} />
                        : <CreditCard size={16} style={{ color: '#4ade80' }} />
                      }
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: notif.is_read ? 600 : 800,
                          color: notif.is_read ? 'rgba(255,255,255,0.6)' : '#fff',
                        }}>
                          {notif.title}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255,255,255,0.3)',
                          flexShrink: 0,
                          marginLeft: '0.5rem',
                        }}>
                          {getTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: notif.is_read ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)',
                        lineHeight: 1.4,
                      }}>
                        {notif.message}
                      </p>
                      {/* Amount badge */}
                      <span style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: notif.type === 'deposit' ? 'rgba(255, 195, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                        color: notif.type === 'deposit' ? '#FFC371' : '#4ade80',
                        border: `1px solid ${notif.type === 'deposit' ? 'rgba(255, 195, 113, 0.2)' : 'rgba(74, 222, 128, 0.2)'}`,
                      }}>
                        ${notif.amount?.toFixed(2)}
                      </span>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#FF7E67',
                        flexShrink: 0,
                        marginTop: '0.3rem',
                        boxShadow: '0 0 8px rgba(255, 126, 103, 0.5)',
                      }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("deposits")}
          style={{
            flex: 1, padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            background: activeTab === "deposits" ? "linear-gradient(90deg, rgba(255, 126, 103, 0.2), rgba(255, 195, 113, 0.1))" : "rgba(255,255,255,0.02)",
            border: activeTab === "deposits" ? "1px solid rgba(255, 126, 103, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            color: activeTab === "deposits" ? "#FFC371" : "rgba(255,255,255,0.5)",
            fontWeight: 700, cursor: "pointer", transition: "all 0.3s"
          }}
        >
          <ArrowDownCircle size={20} />
          Pending Deposits ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          style={{
            flex: 1, padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            background: activeTab === "withdrawals" ? "linear-gradient(90deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.05))" : "rgba(255,255,255,0.02)",
            border: activeTab === "withdrawals" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            color: activeTab === "withdrawals" ? "#4ade80" : "rgba(255,255,255,0.5)",
            fontWeight: 700, cursor: "pointer", transition: "all 0.3s"
          }}
        >
          <CreditCard size={20} />
          Pending Withdrawals ({withdrawals.length})
        </button>
      </div>

      {/* Main Table Card */}
      <div className={styles.glassCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>
            {activeTab === "deposits" ? "Manual Deposit Requests" : "Withdrawal Requests"}
          </h2>
          <button onClick={fetchPayments} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.5rem", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s" }} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading requests...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>User</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Method</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Amount</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Details</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty state */}
                {activeTab === "deposits" && deposits.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.3)" }}>No pending deposit requests.</td></tr>
                )}
                {activeTab === "withdrawals" && withdrawals.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.3)" }}>No pending withdrawal requests.</td></tr>
                )}

                {/* ---- DEPOSITS ---- */}
                {activeTab === "deposits" && deposits.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.3s", opacity: actionLoading === req.id ? 0.5 : 1 }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem" }}>
                      <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{req.user?.name || "Unknown"}</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>{req.user?.email || ""}</p>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {getMethodBadge(req.payment_method)}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ color: "#FFC371", fontWeight: 800, fontSize: "1.15rem" }}>${req.amount?.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: "1rem", maxWidth: "280px" }}>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", wordBreak: "break-word" }}>{req.description}</p>
                    </td>
                    <td style={{ padding: "1rem", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", position: "relative" }}>
                      <button onClick={() => setOpenDropdownId(openDropdownId === req.id ? null : req.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "0.5rem", borderRadius: "50%" }}>
                        <MoreVertical size={20} />
                      </button>
                      {openDropdownId === req.id && (
                        <div style={{ position: "absolute", right: "2rem", top: "2.5rem", background: "#1a1625", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, overflow: "hidden", minWidth: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                           <button onClick={() => { setOpenDropdownId(null); setInspectItem(req); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "white", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><Eye size={16} /> Inspect</button>
                           <button onClick={() => { setOpenDropdownId(null); handleApproveDeposit(req.id, req.user_id, req.amount); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#4ade80", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><CheckCircle size={16} /> Approve</button>
                           <button onClick={() => { setOpenDropdownId(null); handleRejectDeposit(req.id); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", color: "#ff6b6b", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><XCircle size={16} /> Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* ---- WITHDRAWALS ---- */}
                {activeTab === "withdrawals" && withdrawals.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.3s", opacity: actionLoading === req.id ? 0.5 : 1 }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem" }}>
                      <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{req.user?.name || "Unknown"}</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>{req.user?.email || ""}</p>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {getMethodBadge(req.address?.startsWith("Easypaisa") ? "easypaisa" : req.address?.startsWith("JazzCash") ? "jazzcash" : req.address?.startsWith("SadaPay") ? "sadapay" : "crypto")}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ color: "#4ade80", fontWeight: 800, fontSize: "1.15rem" }}>${req.amount?.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: "1rem", maxWidth: "280px" }}>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "monospace", wordBreak: "break-all" }}>{req.address}</p>
                    </td>
                    <td style={{ padding: "1rem", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", position: "relative" }}>
                      <button onClick={() => setOpenDropdownId(openDropdownId === req.id ? null : req.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "0.5rem", borderRadius: "50%" }}>
                        <MoreVertical size={20} />
                      </button>
                      {openDropdownId === req.id && (
                        <div style={{ position: "absolute", right: "2rem", top: "2.5rem", background: "#1a1625", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, overflow: "hidden", minWidth: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                           <button onClick={() => { setOpenDropdownId(null); setInspectItem(req); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "white", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><Eye size={16} /> Inspect</button>
                           <button onClick={() => { setOpenDropdownId(null); handleApproveWithdrawal(req.id); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#4ade80", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><CheckCircle size={16} /> Paid</button>
                           <button onClick={() => { setOpenDropdownId(null); handleRejectWithdrawal(req.id, req.user_id, req.amount); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", color: "#ff6b6b", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}><XCircle size={16} /> Refund</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {inspectItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#1a1625", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "450px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "white", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Eye size={20} /> Inspect Request</h3>
            
            <div style={{ marginBottom: "0.8rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}><strong>User:</strong> <span style={{ color: "#fff" }}>{inspectItem.user?.name}</span> ({inspectItem.user?.email})</div>
            <div style={{ marginBottom: "0.8rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}><strong>Amount:</strong> <span style={{ color: "#4ade80", fontWeight: "bold" }}>${inspectItem.amount?.toFixed(2)}</span></div>
            <div style={{ marginBottom: "0.8rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}><strong>Method:</strong> {inspectItem.payment_method || (inspectItem.address?.split(':')[0]) || "Unknown"}</div>
            <div style={{ marginBottom: "1.5rem", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}><strong>Details:</strong> <span style={{ color: "#fff" }}>{inspectItem.description || inspectItem.address}</span></div>
            
            {/* Screenshot */}
            {inspectItem.receipt_url ? (
              <div style={{ marginBottom: "1.5rem", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.5)" }}>
                <a href={inspectItem.receipt_url} target="_blank" rel="noreferrer">
                  <Image src={inspectItem.receipt_url} alt="Receipt" width={800} height={600} style={{ width: "100%", maxHeight: "300px", objectFit: "contain", display: "block" }} />
                </a>
                <div style={{ textAlign: "center", padding: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Click image to open full size</div>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderRadius: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", border: "1px dashed rgba(255,255,255,0.15)" }}>
                <div style={{ marginBottom: "0.5rem" }}>📸 No screenshot attached.</div>
                <small style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Older requests may not have screenshots uploaded to storage.</small>
              </div>
            )}

            <button onClick={() => setInspectItem(null)} style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontWeight: "bold", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              Close Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
