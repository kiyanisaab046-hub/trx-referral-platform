"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "5",    label: "INCOME TYPES" },
  { value: "100%", label: "INCOME DISTRIBUTION" },
  { value: "10",   label: "RANK LEVELS" },
  { value: "$3",   label: "START TODAY" },
];

/* ── Letter-split animation ── */
const UNIQUE_LETTERS    = "UNIQUE".split("");
const INCOME_LETTERS    = "INCOME PLANE".split("");

const letterVariants: any = {
  hidden: { opacity: 0, y: 60, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.055,
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  }),
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
} as const;

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#050d1a] pt-32 pb-12"
      id="home"
    >
      {/* ── CSS keyframes injected inline ── */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(0,212,255,0.3), 0 2px 8px rgba(0,0,0,0.4); }
          50%       { text-shadow: 0 0 50px rgba(0,212,255,0.7), 0 4px 16px rgba(0,0,0,0.5), 0 0 90px rgba(0,212,255,0.35); }
        }
        @keyframes glow-pulse-2 {
          0%, 100% { text-shadow: 0 0 25px rgba(0,212,255,0.4), 0 2px 10px rgba(0,0,0,0.4); }
          50%       { text-shadow: 0 0 65px rgba(0,212,255,0.85), 0 4px 20px rgba(0,0,0,0.5), 0 0 110px rgba(0,229,255,0.45); }
        }
        @keyframes shimmer-sweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,212,255,0.15), inset 0 0 8px rgba(0,212,255,0.05); }
          50%       { box-shadow: 0 0 28px rgba(0,212,255,0.4), inset 0 0 16px rgba(0,212,255,0.12); }
        }
        @keyframes line-glow {
          0%, 100% { opacity: 0.4; transform: scaleX(0.6); }
          50%       { opacity: 1;   transform: scaleX(1.0); box-shadow: 0 0 20px rgba(0,212,255,0.6); }
        }
        /* Removed infinite glow animations for better performance */
        /* .hero-unique { color: #ffffff; display: inline-block; } */
        /* .hero-income { color: #ffffff; display: inline-block; } */
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #b0e8ff 0%,
            #b0e8ff 35%,
            rgba(0,212,255,0.95) 50%,
            #b0e8ff 65%,
            #b0e8ff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-sweep 3s linear infinite;
        }
        .badge-animated {
          animation: badge-glow 2.5s ease-in-out infinite;
        }
        .divider-glow {
          animation: line-glow 2s ease-in-out infinite;
        }
      `}</style>

        {/* ── Core ambient glow (STATIC, reduced) ── */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="w-[500px] h-[500px] rounded-full blur-[80px] opacity-10"
            style={{ background: "rgba(0,180,220,1)" }}
          />
        </div>

      {/* ── Extra glow orbs behind the headline (STATIC) ── */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-[100px] opacity-10"
        style={{ background: "rgba(0,160,210,1)" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-[100px] opacity-10"
        style={{ background: "rgba(180,90,10,1)" }}
      />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        >
        {/* ── Welcome badge ── */}
          <div
            className="mb-8"
          >
            <span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-sm"
              style={{
                color: "#00d4ff",
                background: "rgba(0,212,255,0.08)",
                border: "1.5px solid rgba(0,212,255,0.3)",
                boxShadow: "0 0 15px rgba(0,212,255,0.2)"
              }}
            >
              ✦ Welcome To ✦
            </span>
          </div>
        </motion.div>

        {/* ── Main headline with letter-by-letter animation ── */}
        <div className="font-display font-black uppercase tracking-tight leading-[0.95] mb-8 text-[clamp(2.5rem,7vw,6rem)] max-w-4xl perspective-[800px]">

          {/* "UNIQUE" — letter split with static glow */}
          <div className="flex justify-center flex-wrap mb-1" style={{ textShadow: "0 0 25px rgba(0,212,255,0.4), 0 2px 10px rgba(0,0,0,0.4)" }}>
            {UNIQUE_LETTERS.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants as any}
                initial="hidden"
                animate="visible"
                className="text-white"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>

          {/* "INCOME PLANE" — static glow */}
          <div className="flex justify-center flex-wrap" style={{ textShadow: "0 0 35px rgba(0,212,255,0.5), 0 2px 10px rgba(0,0,0,0.4)" }}>
            {INCOME_LETTERS.map((char, i) => (
              <motion.span
                key={i}
                custom={i + 8}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-white"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ── Subtitle shimmer ── */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-sans italic mb-6 tracking-wide max-w-xl font-semibold text-cyan-200"
        >
          "Ek Plan – Multiple Income – Life Change"
        </motion.p>


        {/* ── BUILD SMART tagline with pulsing border ── */}
        <motion.p
          variants={itemVariants}
          className="text-xs md:text-sm font-black uppercase tracking-[0.35em] mb-16 px-6 py-2 rounded-full"
          style={{ color: "#a0e8ff", background: "rgba(0,212,255,0.07)", border: "1.5px solid rgba(0,212,255,0.2)" }}
        >
          BUILD SMART &nbsp;•&nbsp; EARN SMART &nbsp;•&nbsp; GROW FAST
        </motion.p>

        {/* ── Stat cards ── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-16 max-w-4xl"
        >
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                y: -8,
                boxShadow: "0 0 30px rgba(0,212,255,0.4)",
                borderColor: "rgba(0,212,255,0.7)",
              }}
              className="flex flex-col items-center justify-center py-8 px-6 rounded-2xl transition-all duration-300 cursor-default"
              style={{ background: "rgba(0,20,50,0.65)", border: "1.5px solid rgba(0,212,255,0.2)", boxShadow: "0 0 10px rgba(0,212,255,0.05)" }}
            >
              <div
                className="text-3xl md:text-4xl font-display font-black mb-2"
                style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.55)" }}
              >
                {s.value}
              </div>
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center"
                style={{ color: "#00d4ff" }}
              >
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA Button ── */}
        <motion.div variants={itemVariants}>
          <motion.a
            href="#join"
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(245,197,24,0.6)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-block px-12 py-5 rounded-full text-[#111] text-base font-display font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_20px_rgba(245,197,24,0.3)]"
            style={{ background: "linear-gradient(90deg, #f5c518, #ffe066, #e6a817)" }}
          >
            Join Now — Just $3
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,212,255,0.03)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />
    </section>
  );
}
