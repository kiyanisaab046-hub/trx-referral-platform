"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useRef } from "react";
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
  const { data: users = [], isLoading: loading } = useSupabaseQuery<User>('users', {}, { order: ['created_at', 'desc'] });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);
  const [upgradeUserId, setUpgradeUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState({ rank: 1, balance: 0 });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showOldDeleteModal, setShowOldDeleteModal] = useState(false);
  // Capture the timestamp when the admin panel is first opened – only users created after this moment are shown
  const newMemberCutoff = useRef<string>(new Date().toISOString());

  const [createUserModal, setCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "anon", referral_code: "" });
  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#fff", boxSizing: "border-box" };
  const cancelBtnStyle = { flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" };
  const saveBtnStyle = { flex: 1, padding: "0.75rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #FF7E67, #FFC371)", color: "#000", fontWeight: 800, cursor: "pointer" };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Helper to determine if a user is "new" based on the selected filter
  const isNewUser = (createdAt: string) => {
    const created = new Date(createdAt);
    const cutoff = new Date(newMemberCutoff.current);
    return created >= cutoff;
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.referral_code?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ).filter(user => isNewUser(user.created_at));

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

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setUpgradeLoading(true);
    await supabase.from('wallets').delete().eq('user_id', deleteUserId);
    await supabase.from('user_ranks').delete().eq('user_id', deleteUserId);
    await supabase.from('users').delete().eq('id', deleteUserId);
    setUpgradeLoading(false);
    setShowDeleteModal(false);
    // Refresh data after deletion
    // (Supabase useSupabaseQuery will revalidate automatically)

    setDeleteUserId(null);
    // Optionally you could trigger a refetch here if needed
  };

  // Bulk delete old users (created before today)
  const handleDeleteOldUsers = async () => {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    setUpgradeLoading(true);
    // Fetch old user IDs
    const { data: oldUsers, error: fetchErr } = await supabase.from('users')
      .select('id')
      .lt('created_at', todayStart.toISOString());
    if (fetchErr) {
      alert('Error fetching old users: ' + fetchErr.message);
      setUpgradeLoading(false);
      return;
    }
    const oldIds = oldUsers?.map(u => u.id) ?? [];
    if (oldIds.length === 0) {
      alert('No old users to delete');
      setUpgradeLoading(false);
      return;
    }
    // Delete related data
    await supabase.from('wallets').delete().in('user_id', oldIds);
    await supabase.from('user_ranks').delete().in('user_id', oldIds);
    // Add other related tables if exist, e.g., referrals, transactions
    try {
      await supabase.from('referrals').delete().in('user_id', oldIds);
    } catch (e) {}
    try {
      await supabase.from('transactions').delete().in('user_id', oldIds);
    } catch (e) {}
    // Delete users
    const { error: delErr } = await supabase.from('users').delete().in('id', oldIds);
    if (delErr) {
      alert('Error deleting users: ' + delErr.message);
    } else {
      alert('Deleted ' + oldIds.length + ' old users successfully');
    }
    setUpgradeLoading(false);
    setShowOldDeleteModal(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      alert('Name and Email are required');
      return;
    }
    setUpgradeLoading(true);
    const { error } = await supabase.from('users').insert([
      {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        referral_code: newUser.referral_code,
        created_at: new Date().toISOString()
      }
    ]);
    if (error) {
      alert('Error creating user: ' + error.message);
    } else {
      alert('User created successfully');
      setCreateUserModal(false);
      setNewUser({ name: "", email: "", role: "anon", referral_code: "" });
    }
    setUpgradeLoading(false);
  };

  const handleUpgradeSubmit = async () => {
    if (!upgradeUserId) return;
    setUpgradeLoading(true);
    await supabase.from('user_ranks').upsert({ user_id: upgradeUserId, rank: upgradeData.rank }, { onConflict: 'user_id' });
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

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
            
            </div>
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
                  <th style={{ padding: "1rem", width: "40px" }}>#</th>
                  <th style={{ padding: "1rem" }}>User</th>
                  <th style={{ padding: "1rem" }}>Role</th>
                  <th style={{ padding: "1rem" }}>Referral Code</th>
                  <th style={{ padding: "1rem" }}>Joined</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.3s" }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "1rem", color: "#fff", fontWeight: 600 }}>{idx + 1}</td>
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
                          <button onClick={() => { setDeleteUserId(user.id); setShowDeleteModal(true); }} style={{ background: "transparent", border: "none", color: "#ff6b6b", padding: "0.5rem 1rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.8rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,107,107,0.1)"} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                            🗑️ Delete User
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
      {/* Delete Old Users Confirmation Modal */}
      {showOldDeleteModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)"
        }}>
          <div style={{
            background: "linear-gradient(145deg, #120d1d 0%, #0a0710 100%)",
            border: "1px solid rgba(255, 126, 103, 0.2)",
            borderRadius: "20px",
            padding: "2rem",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 700 }}>
              ⚠️ Delete Old Users
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem" }}>
              This will permanently delete all user accounts created before today, along with their wallets, ranks, referrals, and transactions. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setShowOldDeleteModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleDeleteOldUsers} style={saveBtnStyle}>Delete</button>
            </div>
          </div>
        </div>
      )}
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
      {/* Create New User Modal */}
      {createUserModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)"
        }}>
          <div style={{
            background: "linear-gradient(145deg, #120d1d 0%, #0a0710 100%)", border: "1px solid rgba(255, 126, 103, 0.2)",
            borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "400px", boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ color: "#fff", margin: "0 0 1.5rem 0", fontSize: "1.2rem", fontWeight: 700 }}>🛠️ Create New User</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Name</label>
              <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Email</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Role</label>
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
                <option value="anon">User</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => setShowOldDeleteModal(true)} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "0.4rem 0.8rem",
                color: "#ff6b6b",
                fontSize: "0.85rem",
                marginLeft: "0.5rem",
                cursor: "pointer"
              }}>Delete Old Users</button>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Referral Code</label>
              <input type="text" value={newUser.referral_code} onChange={e => setNewUser({ ...newUser, referral_code: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setCreateUserModal(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleCreateUser} style={saveBtnStyle}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
