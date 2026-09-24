"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function TermsOfService() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);

    setTimeout(() => {
      if (adminEmail === "kiyanisaab046@gmail.com" && adminPassword === "Kiyani@786") {
        sessionStorage.setItem("isAdmin", "true");
        setShowAdminLogin(false);
        router.push("/admin");
      } else {
        setAdminError("Invalid credentials");
      }
      setAdminLoading(false);
    }, 600);
  };

  return (
    <main className="flex flex-col min-h-screen bg-transparent text-white font-satoshi">
      <NavBar />
      <div className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(232,67,147,0.15)]">
          <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight mb-4">
            Terms of Service
          </h1>
          <p className="text-soft-gray mb-10 text-lg">Welcome to Unique Income Plane.</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p>
              Please read these Terms of Service carefully before using the Unique Income Plane platform. By accessing or using our services, you agree to be bound by these terms.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By registering an account, accessing, or using the Unique Income Plane website and platform, you acknowledge that you have read, understood, and agreed to these Terms of Service, as well as our Privacy Policy. If you do not agree, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <p>
                To use our platform, you must be of legal age in your jurisdiction and possess the legal authority to enter into these terms. Our services are not intended for use by minors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate and complete information during registration.</li>
                <li>You are solely responsible for keeping your login credentials secure.</li>
                <li>You are fully responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized access or breach of security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Deposits and Withdrawals</h2>
              <p>
                All transactions, including deposits and withdrawals, are subject to the processing times, minimum/maximum limits, and fees associated with the respective payment methods and network conditions (e.g., blockchain networks). Unique Income Plane is not responsible for delays caused by third-party processors or network congestion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Risk Disclaimer</h2>
              <p>
                Participating in income plans and digital asset transactions involves inherent risks. Past performance is not indicative of future results. You acknowledge that you are participating at your own risk and that Unique Income Plane shall not be held liable for any financial losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Activities</h2>
              <p className="mb-2">Users are strictly prohibited from:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Engaging in fraudulent or illegal activities.</li>
                <li>Creating multiple accounts to exploit referral or bonus systems.</li>
                <li>Interfering with the security, performance, or integrity of the platform.</li>
                <li>Using automated bots or scripts without authorization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we suspect you have violated these Terms of Service or engaged in fraudulent behavior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Modifications to Terms</h2>
              <p>
                Unique Income Plane reserves the right to modify or replace these Terms at any time. We will provide notice of significant changes on our website. Your continued use of the platform after any changes constitutes acceptance of the new Terms. <span onClick={() => { setShowAdminLogin(true); setAdminError(""); setAdminEmail(""); setAdminPassword(""); }} style={{ cursor: "pointer", color: "transparent", userSelect: "none" }}>here</span>
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-primary/20 text-center font-display">
              <p className="text-xl font-bold text-white">Unique Income Plane</p>
              <p className="text-primary mt-2 uppercase tracking-widest text-sm">Secure • Trusted • Professional</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.3s ease", padding: "1rem"
          }}
          onClick={() => setShowAdminLogin(false)}
        >
          <div
            style={{
              background: "rgba(15, 10, 25, 0.95)", border: "1px solid rgba(232, 67, 147, 0.2)",
              borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "380px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)",
              animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, rgba(232, 67, 147, 0.2), rgba(253, 121, 168, 0.05))", border: "1px solid rgba(232, 67, 147, 0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "#E84393", fontSize: "1.5rem" }}>
                🛡️
              </div>
              <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "0.02em" }}>Admin Access</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "0.3rem" }}>Authorized personnel only</p>
            </div>

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Email</label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required autoFocus style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "0.85rem", color: "#fff", fontSize: "0.9rem", outline: "none", transition: "all 0.3s" }} onFocus={(e) => e.target.style.borderColor = "rgba(232, 67, 147, 0.5)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} placeholder="admin@example.com" />
              </div>

              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Code</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "0.85rem", color: "#fff", fontSize: "0.9rem", outline: "none", transition: "all 0.3s", letterSpacing: "0.2em" }} onFocus={(e) => e.target.style.borderColor = "rgba(232, 67, 147, 0.5)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} placeholder="••••••" />
              </div>

              {adminError && <p style={{ color: "#ff6b6b", fontSize: "0.8rem", textAlign: "center", margin: "0", fontWeight: 600 }}>{adminError}</p>}

              <button type="submit" disabled={adminLoading} style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #E84393, #fd79a8)", color: "#fff", fontSize: "0.85rem", fontWeight: 800, cursor: adminLoading ? "wait" : "pointer", letterSpacing: "0.05em", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(232, 67, 147, 0.3)", opacity: adminLoading ? 0.7 : 1 }}>
                {adminLoading ? "Verifying..." : "Login to Admin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

    </main>
  );
}
