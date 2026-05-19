"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["About", "Income", "Ranks", "Rewards", "Join"];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  // Staggered variants for mobile links
  const menuVariants: any = {
    closed: { 
      opacity: 0,
      y: "-100%",
      transition: { duration: 0.4, ease: [0.3, 0, 0.2, 1], staggerChildren: 0.05, staggerDirection: -1 }
    },
    open: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.3, 0, 0.2, 1], staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const linkVariants: any = {
    closed: { opacity: 0, y: -15, transition: { duration: 0.3 } },
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  return (
    <>
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-[#D4AF37]/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Left — Brand */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <span className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C7913C] text-[#050505] text-xs font-black uppercase tracking-[0.15em] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            UIP
          </span>
          <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-[#D4AF37] group-hover:to-[#F5C542] text-sm uppercase tracking-[0.25em] hidden sm:block transition-all duration-300">
            Unique Income Plan
          </span>
        </Link>

        {/* Center — Nav Links (Desktop Only) */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((txt) => (
            <li key={txt}>
              <Link
                href={`#${txt.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7a5a] hover:text-[#F5C542] transition-colors duration-300 relative group"
              >
                {txt}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Area */}
        <div className="flex items-center gap-4">
          {/* Auth Buttons (Desktop Only) */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/signin"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/[0.06] transition-all duration-300 rounded-full"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-[#D4AF37] to-[#C7913C] text-[#050505] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 rounded-full font-black"
            >
              Register
            </Link>
          </div>

          {/* Hamburger Mobile Toggle (Mobile Only) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center gap-[6px] w-10 h-10 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-300 focus:outline-none z-50 relative"
            aria-label="Toggle Menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-5 h-[2px] bg-[#D4AF37] rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-[2px] bg-[#D4AF37] rounded-full"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="w-5 h-[2px] bg-[#D4AF37] rounded-full origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-x-0 top-0 h-screen bg-[#050505]/95 backdrop-blur-2xl border-b border-[#D4AF37]/10 z-40 flex flex-col justify-center px-10 md:hidden"
          >
            {/* Background luxury glow in overlay */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

            <ul className="flex flex-col gap-6 mb-12">
              {navLinks.map((txt) => (
                <motion.li key={txt} variants={linkVariants}>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href={`#${txt.toLowerCase()}`}
                    className="text-2xl font-display font-black uppercase tracking-[0.25em] text-[#8a7a5a] hover:text-[#F5C542] transition-colors duration-300"
                  >
                    {txt}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={linkVariants} className="flex flex-col gap-4">
              <Link
                onClick={() => setIsOpen(false)}
                href="/signin"
                className="w-full py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/[0.02]"
              >
                Login
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                href="/signup"
                className="w-full py-4 text-center text-sm font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C] text-[#050505] rounded-full font-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                Register
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
