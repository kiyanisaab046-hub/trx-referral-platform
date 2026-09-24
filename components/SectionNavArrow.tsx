import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback } from "react";

interface SectionNavArrowProps {
  prev?: string; // CSS selector or hash to previous section
  next?: string; // CSS selector or hash to next section
}

// Helper to briefly highlight a target section when navigation occurs
const triggerSectionGlow = (hash: string | undefined) => {
  if (!hash) return;
  // Remove leading # if present
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("section-glow");
  // Remove after animation duration (1s)
  setTimeout(() => el.classList.remove("section-glow"), 1200);
};

export default function SectionNavArrow({ prev, next }: SectionNavArrowProps) {
  const arrowClass = "fixed bottom-8 md:bottom-12 right-8 md:right-12 w-12 h-12 bg-primary/20 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.8)] transition-colors shadow-[0_0_15px_rgba(0,212,255,0.4)] group relative";
  const handleClick = useCallback((hash?: string) => {
    triggerSectionGlow(hash);
  }, []);

  return (
    <>
      {prev && (
        <Link href={prev} scroll={false}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(prev)}
            className={arrowClass}
          >
            {/* Glow overlay */}
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 0.6, scale: 1.4 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.div>
        </Link>
      )}
      {next && (
        <Link href={next} scroll={false}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(next)}
            className={arrowClass}
            style={{ right: prev ? "calc(2rem + 6rem)" : "2rem" }}
          >
            {/* Glow overlay */}
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 0.6, scale: 1.4 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </Link>
      )}
    </>
  );
}

/* Section glow animation - apply to any section element */
<style jsx>{`
  @keyframes glowPulse {
    0% { box-shadow: 0 0 0px rgba(0,212,255,0.6); }
    50% { box-shadow: 0 0 20px rgba(0,212,255,0.9); }
    100% { box-shadow: 0 0 0px rgba(0,212,255,0.6); }
  }
  .section-glow {
    animation: glowPulse 1.2s ease-out;
  }
`}</style>

