"use client";

import React from "react";
import Link from "next/link";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Income", href: "#income" },
  { label: "Ranks", href: "#ranks" },
  { label: "Rewards", href: "#rewards" },
  { label: "Join", href: "#join" },
  { label: "Admin", href: "/admin-login" },
];

const supportLinks = [
  { label: "Help Center",     href: "#" },
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Terms of Service",href: "/terms" },
  { label: "Contact Support", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-transparent border-t border-primary/15 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-gradient-to-r from-primary to-highlight text-[#050505] text-xs font-black uppercase tracking-wider rounded-full">
                UIP
              </span>
              <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-base uppercase tracking-widest">
                Unique Income
              </span>
            </div>
            <p className="text-soft-gray text-sm leading-relaxed font-light">
              A premium financial empowerment ecosystem — 5 income streams, 10 ranks, starting at just $3.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-black text-accent uppercase tracking-wider text-xs mb-6">Navigation</h4>
            <ul className="space-y-4">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-soft-gray hover:text-secondary transition-colors duration-300 font-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-black text-accent uppercase tracking-wider text-xs mb-6">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-soft-gray hover:text-secondary transition-colors duration-300 font-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-black text-accent uppercase tracking-wider text-xs mb-6">Support/Newsletter</h4>
            <p className="text-soft-gray text-sm mb-5 font-light">Stay updated with the latest income strategies.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#0c0a10] border border-primary/20 rounded-full px-5 py-2.5 text-xs text-white placeholder-soft-gray/50 focus:outline-none focus:border-primary/65 transition-all w-full"
              />
              <button className="bg-gradient-to-r from-primary to-highlight text-[#050505] font-black rounded-full px-5 py-2.5 text-xs hover:shadow-[0_0_15px_rgba(255,154,134,0.3)] transition-all flex-shrink-0">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-soft-gray font-light">
            © 2024 Unique Income Plane. All rights reserved.
          </p>
          <div className="flex gap-3">
            {["T", "F", "I"].map((s) => (
              <div
                key={s}
                className="w-10 h-10 rounded-full border border-primary/20 hover:border-primary/60 flex items-center justify-center text-xs font-black text-primary/80 hover:bg-primary/[0.06] hover:text-secondary transition-all duration-300 cursor-pointer"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
