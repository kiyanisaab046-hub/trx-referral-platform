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

const letterVariants = {
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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent pt-32 pb-24"
      id="home"
    >
      {/* ── CSS keyframes injected inline ── */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(61,0,21,0.35), 0 2px 8px rgba(0,0,0,0.2); }
          50%       { text-shadow: 0 0 45px rgba(61,0,21,0.65), 0 4px 16px rgba(0,0,0,0.3), 0 0 80px rgba(232,67,147,0.25); }
        }
        @keyframes glow-pulse-2 {
          0%, 100% { text-shadow: 0 0 25px rgba(61,0,21,0.5), 0 2px 10px rgba(0,0,0,0.25); }
          50%       { text-shadow: 0 0 60px rgba(61,0,21,0.9), 0 4px 20px rgba(0,0,0,0.35), 0 0 100px rgba(232,67,147,0.4); }
        }
        @keyframes shimmer-sweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(26,5,0,0.15), inset 0 0 8px rgba(26,5,0,0.05); }
          50%       { box-shadow: 0 0 25px rgba(26,5,0,0.35), inset 0 0 16px rgba(26,5,0,0.12); }
        }
        @keyframes line-glow {
          0%, 100% { opacity: 0.4; transform: scaleX(0.6); }
          50%       { opacity: 1;   transform: scaleX(1.0); box-shadow: 0 0 20px rgba(61,0,21,0.5); }
        }
        .hero-unique {
          color: #1A0500;
          animation: glow-pulse 3s ease-in-out infinite;
          display: inline-block;
        }
        .hero-income {
          color: #3D0015;
          animation: glow-pulse-2 2.5s ease-in-out infinite 0.5s;
          display: inline-block;
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #1A0500 0%,
            #1A0500 35%,
            rgba(232,67,147,0.8) 50%,
            #1A0500 65%,
            #1A0500 100%
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

      {/* ── Core ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-[900px] h-[900px] rounded-full bg-primary blur-[180px]"
        />
      </div>

      {/* ── Extra glow orbs behind the headline ── */}
      <motion.div
        animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "rgba(61,0,21,0.12)" }}
      />
      <motion.div
        animate={{ x: [20, -20, 20], y: [10, -10, 10] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "rgba(232,67,147,0.1)" }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
      >
        {/* ── Welcome badge ── */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="mb-8"
        >
          <span
            className="badge-animated inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-sm"
            style={{
              color: "#1A0500",
              background: "rgba(26,5,0,0.08)",
              border: "1.5px solid rgba(26,5,0,0.3)",
            }}
          >
            ✦ Welcome To ✦
          </span>
        </motion.div>

        {/* ── Main headline with letter-by-letter animation ── */}
        <div className="font-display font-black uppercase tracking-tight leading-[0.95] mb-8 text-[clamp(2.5rem,7vw,6rem)] max-w-4xl perspective-[800px]">

          {/* "UNIQUE" — letter split with glow */}
          <div className="flex justify-center flex-wrap mb-1">
            {UNIQUE_LETTERS.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="hero-unique"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>

          {/* "INCOME PLANE" — shimmer sweep effect */}
          <div className="flex justify-center flex-wrap">
            {INCOME_LETTERS.map((char, i) => (
              <motion.span
                key={i}
                custom={i + 8}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="hero-income"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ── Subtitle shimmer ── */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-sans italic mb-6 tracking-wide max-w-xl font-semibold shimmer-text"
        >
          "Ek Plan – Multiple Income – Life Change"
        </motion.p>

        {/* ── Animated divider line ── */}
        <motion.div
          variants={itemVariants}
          className="relative mx-auto mb-8 h-[2px] w-56 overflow-hidden rounded-full"
          style={{ background: "rgba(26,5,0,0.15)" }}
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2"
            style={{ background: "linear-gradient(90deg, transparent, #3D0015, transparent)" }}
          />
        </motion.div>

        {/* ── BUILD SMART tagline with pulsing border ── */}
        <motion.p
          variants={itemVariants}
          animate={{
            boxShadow: [
              "0 0 0px rgba(61,0,21,0)",
              "0 0 18px rgba(61,0,21,0.35)",
              "0 0 0px rgba(61,0,21,0)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-xs md:text-sm font-black uppercase tracking-[0.35em] mb-16 px-6 py-2 rounded-full"
          style={{ color: "#1A0500", background: "rgba(26,5,0,0.08)", border: "1.5px solid rgba(26,5,0,0.2)" }}
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
                boxShadow: "0 0 30px rgba(232,67,147,0.35)",
                borderColor: "rgba(232,67,147,0.7)",
              }}
              animate={{
                boxShadow: [
                  "0 0 0px rgba(61,0,21,0.1)",
                  "0 0 20px rgba(61,0,21,0.25)",
                  "0 0 0px rgba(61,0,21,0.1)",
                ],
              }}
              transition={{
                boxShadow: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                  delay: idx * 0.4,
                },
              }}
              className="flex flex-col items-center justify-center py-8 px-6 rounded-2xl backdrop-blur-sm transition-all duration-300 cursor-default"
              style={{ background: "rgba(26,5,0,0.78)", border: "1.5px solid rgba(61,0,21,0.45)" }}
            >
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: idx * 0.3 }}
                className="text-3xl md:text-4xl font-display font-black mb-2"
                style={{ color: "#FF9A86", textShadow: "0 0 20px rgba(255,154,134,0.6)" }}
              >
                {s.value}
              </motion.span>
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center"
                style={{ color: "#f5c6aa" }}
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(232,67,147,0.55)" }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(232,67,147,0.2)",
                "0 0 40px rgba(232,67,147,0.45)",
                "0 0 20px rgba(232,67,147,0.2)",
              ],
            }}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
            }}
            className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-primary via-secondary to-highlight text-[#050505] text-base font-display font-black uppercase tracking-[0.25em] transition-all duration-300"
          >
            Join Now — Just $3
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,154,134,0.015)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,154,134,0.015)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
    </section>
  );
}
