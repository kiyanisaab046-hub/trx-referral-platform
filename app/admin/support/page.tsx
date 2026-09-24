"use client";
export const dynamic = 'force-dynamic';
import React from "react";
import styles from "../admin.module.css";

export default function AdminSupport() {
  return (
    <div className={styles.glassCard}>
      <h2 style={{color: "#fff"}}>Support System</h2>
      <p style={{color: "rgba(255,255,255,0.5)"}}>Manage Tickets, Live Chat, and FAQs.</p>
    </div>
  );
}
