import React from "react";
import styles from "../admin.module.css";

export default function AdminSettings() {
  return (
    <div className={styles.glassCard}>
      <h2 style={{color: "#fff"}}>Design Settings</h2>
      <p style={{color: "rgba(255,255,255,0.5)"}}>Manage Theme Colors, Layout, and Animations.</p>
    </div>
  );
}
