"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Filter, Ban, MoreVertical, ShieldAlert } from "lucide-react";
import styles from "../admin.module.css";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  sponsor: string | null;
  referral_code: string;
};

export default function AdminUsers() {
  const { data: users = [], isLoading: loading } = useSupabaseQuery<User>('users', { role: 'anon' }, { order: ['created_at', 'desc'] });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);
  const [upgradeUserId, setUpgradeUserId] = useState<string | null>(null);
  const [upgradeData, setUpgradeData] = useState({ rank: 1, balance: 0 });
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Users are fetched via useSupabaseQuery hook; no manual effect needed.

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.referral_code?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const openUpgradeModal = async (userId: string) => {
    setUpgradeUserId(userId);
    setActionMenuUserId(null);
    setUpgradeLoading(true);
    const { data: rankData } = await supabase.from('user_ranks').select('rank').eq('user_id', userId).single();
    const { data: walletData } = await supabase.from('wallets').select('main_balance').eq('user_id', userId).single();
    setUpgradeData({
      rank: rankData?.rank || 1,
      balance: walletData?.main_balance || 0
    });
    setUpgradeLoading(false);
  };

  const handleUpgradeSubmit = async () => {
    if (!upgradeUserId) return;
    setUpgradeLoading(true);
    await supabase.from('user_ranks').upsert({ user_id: upgradeUserId, rank: upgradeData.rank });
    await supabase.from('wallets').update({ main_balance: upgradeData.balance }).eq('user_id', upgradeUserId);
    setUpgradeUserId(null);
    setUpgradeLoading(false);
    alert("User updated successfully!");
  };

  return (
    <div>
      <div className={styles.glassCard}>
        {/* Header and Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>User Management</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "0.5rem 1rem 0.5rem 2.5rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  width: "250px",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#FF7E67")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <button style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}>
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* User Table */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading users...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "1rem" }}>User</th>
                  <th style={{ padding: "1rem" }}>Role</th>
                  <th style={{ padding: "1rem" }}>Referral Code</th>
                  <th style={{ padding: "1rem" }}>Joined</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.3s" }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(255, 126, 103, 0.2), rgba(255, 195, 113, 0.2))", color: "#FFC371", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem" }}>
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{user.name}</p>
                          <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        background: user.role === "admin" ? "rgba(255, 126, 103, 0.15)" : "rgba(255,255,255,0.05)",
                        color: user.role === "admin" ? "#FF7E67" : "#fff",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: `1px solid ${user.role === "admin" ? "rgba(255, 126, 103, 0.3)" : "rgba(255,255,255,0.1)"}`
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 600 }}>
                      {user.referral_code}
                    </td>
                    <td style={{ padding: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", position: "relative" }}>
                      <button 
                        onClick={() => setActionMenuUserId(actionMenuUserId === user.id ? null : user.id)}
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "color 0.3s" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#FF7E67"}
                        onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* 3-Dot Dropdown Menu */}
                      {actionMenuUserId === user.id && (
                        <div style={{
                          position: "absolute",
                          right: "40px",
                          top: "10px",
                          background: "rgba(18, 13, 29, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 126, 103, 0.2)",
                          borderRadius: "10px",
                          padding: "0.5rem",
                          zIndex: 10,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                          minWidth: "140px",
                          textAlign: "left"
                        }}>
                          <button style={{ background: "transparent", border: "none", color: "#fff", padding: "0.5rem 1rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.8rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                            👤 View Profile
                          </button>
                          <button onClick={() => openUpgradeModal(user.id)} style={{ background: "transparent", border: "none", color: "#FFC371", padding: "0.5rem 1rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.8rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,195,113,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                            ⭐ Upgrade User
                          </button>
                          <button style={{ background: "transparent", border: "none", color: "#ff6b6b", padding: "0.5rem 1rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.8rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,107,107,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                            🚫 Ban User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upgrade User Modal */}
      {upgradeUserId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)"
        }}>
          <div style={{
            background: "linear-gradient(145deg, #120d1d 0%, #0a0710 100%)", border: "1px solid rgba(255, 126, 103, 0.2)",
            borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "400px", boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 700 }}>⭐ Upgrade User Account</h3>
            
            {upgradeLoading ? (
              <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem 0" }}>Loading user data...</p>
            ) : (
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Rank Level (1-10)</label>
                  <input type="number" min="1" max="10" value={upgradeData.rank} onChange={(e) => setUpgradeData({...upgradeData, rank: parseInt(e.target.value)})} style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", boxSizing: "border-box"
                  }} />
                </div>
                
                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Wallet Balance ($)</label>
                  <input type="number" step="0.01" value={upgradeData.balance} onChange={(e) => setUpgradeData({...upgradeData, balance: parseFloat(e.target.value)})} style={{
                    width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", boxSizing: "border-box"
                  }} />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button onClick={() => setUpgradeUserId(null)} style={{
                    flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer"
                  }}>Cancel</button>
                  <button onClick={handleUpgradeSubmit} style={{
                    flex: 1, padding: "0.75rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #FF7E67, #FFC371)", color: "#000", fontWeight: 800, cursor: "pointer"
                  }}>Save Upgrade</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
