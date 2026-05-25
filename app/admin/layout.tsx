"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  MessageSquare,
  Wrench,
  Sparkles,
  LogOut,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import styles from "./admin.module.css";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Design Settings", path: "/admin/settings", icon: Settings },
  { name: "Notifications", path: "/admin/notifications", icon: Bell },
  { name: "Support System", path: "/admin/support", icon: MessageSquare },
  { name: "Maintenance", path: "/admin/maintenance", icon: Wrench },
  { name: "Extra Features", path: "/admin/extra", icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    router.push("/");
  };

  if (loading) {
    return (
      <div className={styles.adminLayout} style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #FF7E67", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>UIP Admin</h2>
          <p className={styles.sidebarSubtitle}>Premium Control</p>
        </div>

        <nav className={styles.navContainer}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(`${item.path}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.exitBtn}>
            <ArrowLeft size={18} /> Exit to App
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>
            {navItems.find((item) => item.path === pathname)?.name || "Dashboard"}
          </h1>

          <div className={styles.topbarRight}>
            <button className={styles.notificationBtn}>
              <Bell size={20} />
              <span className={styles.notificationBadge}></span>
            </button>
            <div className={styles.adminProfile}>
              <div className={styles.adminInfo}>
                <p className={styles.adminRole}>Super Admin</p>
                <p className={styles.adminEmail}>fazal@gmail.com</p>
              </div>
              <div className={styles.adminAvatar}>ZK</div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
