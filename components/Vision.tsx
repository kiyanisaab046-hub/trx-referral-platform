"use client";

import { motion } from "framer-motion";
import { 
  GlobeAltIcon,
  ChevronDoubleRightIcon 
} from "@heroicons/react/24/outline";

export default function Vision() {
  return (
    <section 
      className="relative py-32 bg-gradient-to-b from-[#050505] via-[#080604] to-[#050505] overflow-hidden" 
      id="vision"
    >
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/2 left-[-100px] w-[500px] h-[500px] bg-[#D4AF37]/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-[-100px] w-[400px] h-[400px] bg-[#C7913C]/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-1.5 rounded-full border border-[#D4AF37]/20">
              Our Direction
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">
              Our{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C]">
              Vision
            </span>
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto items-center">
          
          {/* Left - Narrative & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C7913C] mb-6 uppercase tracking-wide">
              Financial Empowerment
            </h3>
            <p className="text-lg leading-relaxed text-[#8a7a5a] group-hover:text-[#c9b896] font-light max-w-xl mb-10">
              A future where every member can create lasting wealth through transparent, 
              multi-source income streams — building generational prosperity together.
            </p>

            {/* Quick Stat Blocks */}
            <div className="grid grid-cols-2 gap-5">
              {[
                { num: "5+", label: "Income Streams" },
                { num: "10", label: "Rank Levels" },
                { num: "100%", label: "Payout Rate" },
                { num: "$3", label: "Starting Cost" },
              ].map((s, i) => (
                <motion.div 
                  key={s.label}
                  whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.4)" }}
                  className="relative p-5 rounded-xl border border-[#D4AF37]/[0.08] bg-[#0c0a08]/80 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5C542]">{s.num}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8a7a5a] font-bold mt-2">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Floating Holographic Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative h-72 rounded-2xl overflow-hidden border border-[#D4AF37]/[0.08] bg-[#0c0a08]/60 backdrop-blur-md flex flex-col items-center justify-center p-8 group transition-all duration-500 shadow-2xl cursor-default"
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/[0.05] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-[#D4AF37]/[0.1] transition-all duration-500" />
            
            {/* Spinning decorative background sphere */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-44 h-44 rounded-full border border-[#D4AF37]/5 border-t-[#D4AF37]/20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-36 h-36 rounded-full border border-[#D4AF37]/5 border-b-[#D4AF37]/20" />
            </motion.div>

            {/* Glowing Logo */}
            <div className="relative mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/[0.08] to-transparent border border-[#D4AF37]/15 group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                <GlobeAltIcon className="w-10 h-10 text-[#D4AF37]/60 group-hover:text-[#F5C542] transition-colors" />
              </div>
            </div>

            <span className="relative text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 opacity-60 select-none tracking-wider group-hover:opacity-90 transition-opacity">
              UIP GLOBAL
            </span>

            <div className="flex items-center gap-2 mt-4 text-[10px] text-[#8a7a5a] group-hover:text-[#D4AF37] uppercase tracking-[0.2em] font-bold transition-colors">
              <span>Enter Ecosystem</span>
              <ChevronDoubleRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
