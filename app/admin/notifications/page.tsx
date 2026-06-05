"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../admin.module.css";
import { Bell } from "lucide-react";

export default function AdminNotifications() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("id, type, title, message, amount, created_at, is_read")
      .order("created_at", { ascending: false });
    if (!error) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const subscription = supabase
      .channel("admin-notifications-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload: any) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const markAsRead = async (id: number) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className={styles.glassCard}>
      <div className={styles.metricHeader}>
        <Bell size={24} />
        <h2 className={styles.metricTitle}>Admin Notifications</h2>
        {unreadCount > 0 && (
          <span className={styles.notificationBadge} style={{ background: "#ff4d4f" }}>{unreadCount}</span>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className={styles.notificationList}>
          {notifications.map((n) => (
            <li key={n.id} className={styles.notificationItem} style={{ opacity: n.is_read ? 0.6 : 1 }}>
              <div>
                <strong>{n.title}</strong> – {n.message}
                {n.amount && <span> (${n.amount})</span>}
                <br />
                <small>{new Date(n.created_at).toLocaleString()}</small>
              </div>
              {!n.is_read && (
                <button onClick={() => markAsRead(n.id)} className={styles.markReadBtn}>Mark read</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
import React from "react";
import styles from "../admin.module.css";

export default function AdminNotifications() {
  return (
    <div className={styles.glassCard}>
      <h2 style={{color: "#fff"}}>Notification System</h2>
      <p style={{color: "rgba(255,255,255,0.5)"}}>Manage Broadcasts, Emails, and Alerts.</p>
    </div>
  );
}
