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
