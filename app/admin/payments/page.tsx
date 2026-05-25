"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { CheckCircle, XCircle, ArrowDownCircle, CreditCard, RefreshCw, MoreVertical, Eye } from "lucide-react";
import styles from "../admin.module.css";

const METHOD_COLORS: Record<string, string> = {
  easypaisa: '#2ecc71',
  jazzcash: '#e74c3c',
  sadapay: '#8e44ad',
  crypto: '#00d2ff',
  manual: '#FFC371',
};

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<any | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchPayments = useCallback(async () => {
    setLoading(true);

    // Fetch ALL pending manual deposits (easypaisa, jazzcash, sadapay, manual)
    const { data: depData } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .in("payment_method", ["easypaisa", "jazzcash", "sadapay", "manual"])
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

    return () => {
      supabase.removeChannel(depChannel);
      supabase.removeChannel(withChannel);
    };
  }, [fetchPayments, supabase]);

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

  return (
    <div>
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
                  <img src={inspectItem.receipt_url} alt="Receipt" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", display: "block" }} />
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
