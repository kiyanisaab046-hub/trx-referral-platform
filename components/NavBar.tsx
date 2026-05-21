"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../lib/supabase/client";

const navLinks = ["About", "Income", "Ranks", "Rewards", "Join"];

export default function NavBar() {
  const supabase = createClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUser(user);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setIsOpen(false);
    router.push('/signin');
  };

  // Staggered variants for mobile links (optimized to avoid full-screen translates with backdrop-blur)
  const menuVariants: any = {
    closed: { 
      opacity: 0,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    open: { 
      opacity: 1,
      transition: { duration: 0.25, ease: "easeInOut", staggerChildren: 0.04, delayChildren: 0.05 }
    }
  };

  const linkVariants: any = {
    closed: { opacity: 0, y: -8, transition: { duration: 0.15 } },
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }
  };

  return (
    <>
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-primary/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Left — Brand */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <img src="https://anyimage.io/storage/uploads/357abaf76df985e6480832402d9dafbc" alt="Logo" className="h-8 w-auto" style={{ filter: "brightness(0.8)" }} />
          <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-primary group-hover:to-secondary text-sm uppercase tracking-[0.25em] hidden sm:block transition-all duration-300">
            Unique Income Plan
          </span>
        </Link>

        {/* Center — Nav Links (Desktop Only) */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((txt) => (
            <li key={txt}>
              <Link
                href={`#${txt.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-soft-gray hover:text-secondary transition-colors duration-300 relative group"
              >
                {txt}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Area */}
        <div className="flex items-center gap-4">
          {/* Auth Buttons (Desktop Only) */}
          <div className="hidden md:flex items-center gap-4">
            {sessionUser ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-primary to-highlight text-[#050505] font-black text-sm uppercase shadow-[0_0_15px_rgba(255,154,134,0.2)] hover:shadow-[0_0_20px_rgba(255,154,134,0.4)] transition-all duration-300 z-50 relative border border-primary/50"
                >
                  {sessionUser.email ? sessionUser.email[0].toUpperCase() : 'U'}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#090909]/95 border border-primary/25 shadow-[0_10px_35px_rgba(0,0,0,0.9)] z-50 overflow-hidden backdrop-blur-2xl">
                      <div className="px-4 py-3 bg-[#0d0d0d] border-b border-primary/10">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Signed in as</p>
                        <p className="text-xs text-primary font-semibold truncate mt-0.5">{sessionUser.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-200"
                        >
                          👤 Player Dashboard
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-200"
                        >
                          💸 Deposit Money
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-200"
                        >
                          📥 Withdraw Funds
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 text-left border-t border-primary/10"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-primary border border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 rounded-full"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-primary to-secondary text-[#050505] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)] transition-all duration-300 rounded-full font-black"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Mobile Toggle (Mobile Only) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center gap-[6px] w-10 h-10 rounded-full border border-primary/20 bg-primary/5 text-primary hover:border-primary/50 transition-all duration-300 focus:outline-none z-50 relative"
            aria-label="Toggle Menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-[2px] bg-primary rounded-full origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="w-5 h-[2px] bg-primary rounded-full"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-[2px] bg-primary rounded-full origin-center"
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
            className="fixed inset-0 h-screen bg-[#050505]/95 backdrop-blur-md border-b border-primary/10 z-40 flex flex-col justify-center px-10 md:hidden"
          >
            {/* Background luxury glow in overlay */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <ul className="flex flex-col gap-6 mb-12">
              {navLinks.map((txt) => (
                <motion.li key={txt} variants={linkVariants}>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href={`#${txt.toLowerCase()}`}
                    className="text-2xl font-display font-black uppercase tracking-[0.25em] text-soft-gray hover:text-secondary transition-colors duration-300"
                  >
                    {txt}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={linkVariants} className="flex flex-col gap-4">
              {sessionUser ? (
                <div className="flex flex-col gap-3 border-t border-primary/10 pt-6">
                  <div className="px-4 py-2.5 bg-[#0d0d0d] border border-primary/15 rounded-xl text-center mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Signed in as</p>
                    <p className="text-xs text-primary font-semibold truncate mt-0.5">{sessionUser.email}</p>
                  </div>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/dashboard"
                    className="w-full py-3.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 rounded-full bg-primary/[0.02]"
                  >
                    👤 Player Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-red-400 border border-red-500/20 bg-red-500/5 rounded-full"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/signin"
                    className="w-full py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 rounded-full bg-primary/[0.02]"
                  >
                    Login
                  </Link>
                  <Link
                    onClick={() => setIsOpen(false)}
                    href="/signup"
                    className="w-full py-4 text-center text-sm font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-secondary to-highlight text-[#050505] rounded-full font-black shadow-[0_0_20px_rgba(255,154,134,0.2)]"
                  >
                    Register
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
