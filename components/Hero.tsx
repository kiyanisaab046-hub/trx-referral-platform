"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "5", label: "INCOME TYPES" },
  { value: "100%", label: "INCOME DISTRIBUTION" },
  { value: "10", label: "RANK LEVELS" },
  { value: "$3", label: "START TODAY" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  },
} as const;

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505] pt-32 pb-24"
      id="home"
    >
      {/* Premium Pastel Core Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.04, 0.07, 0.04] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8, 
            ease: "easeInOut" 
          }}
          className="w-[800px] h-[800px] rounded-full bg-primary blur-[150px]" 
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
      >
        {/* Welcome Badge - Floating Bobbing Animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 3.5, 
            ease: "easeInOut" 
          }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/[0.06] border border-primary/35 text-primary text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-sm">
            ✦ Welcome To ✦
          </span>
        </motion.div>

        {/* Main Title - Pastel Gradient */}
        <motion.h1
          variants={itemVariants}
          className="font-display font-black uppercase tracking-tight leading-[0.95] mb-8 text-[clamp(2.5rem,7vw,6rem)] max-w-4xl"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
            Unique{" "}
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight drop-shadow-[0_0_30px_rgba(255,154,134,0.2)]">
            Income Plan
          </span>
        </motion.h1>

        {/* Subtitle / Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-sans italic text-highlight/80 mb-6 tracking-wide max-w-xl font-light"
        >
          "Ek Plan – Multiple Income – Life Change"
        </motion.p>

        {/* Animated Sweep Light Line */}
        <motion.div 
          variants={itemVariants}
          className="relative mx-auto mb-8 h-[2px] w-48 overflow-hidden rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-secondary to-transparent"
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xs md:text-sm font-bold uppercase tracking-[0.35em] text-primary mb-16 bg-primary/[0.03] border border-primary/10 px-6 py-2 rounded-full"
        >
          BUILD SMART &nbsp;•&nbsp; EARN SMART &nbsp;•&nbsp; GROW FAST
        </motion.p>

        {/* Glassmorphic Stat Boxes */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-16 max-w-4xl"
        >
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, borderColor: "rgba(255,154,134,0.4)" }}
              className="group relative flex flex-col items-center justify-center py-8 px-6 rounded-2xl border border-primary/[0.08] bg-[#0c0a08]/80 backdrop-blur-sm transition-all duration-300"
            >
              {/* Stat glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/[0.02] blur-xl transition-all duration-300 pointer-events-none" />
              
              <span className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 group-hover:scale-105 transition-transform duration-300">
                {s.value}
              </span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-soft-gray group-hover:text-highlight transition-colors duration-300 text-center">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Deluxe CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.a
            href="#join"
            whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(255,154,134,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-primary via-secondary to-highlight text-[#050505] text-base font-display font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_20px_rgba(255,154,134,0.2)]"
          >
            Join Now — Just $3
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,154,134,0.015)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,154,134,0.015)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
    </section>
  );
}
