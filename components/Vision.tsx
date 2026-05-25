"use client";

import { motion } from "framer-motion";
import { 
  GlobeAltIcon,
  ChevronDoubleRightIcon 
} from "@heroicons/react/24/outline";

export default function Vision() {
  return (
    <section 
      className="relative py-20 bg-transparent" 
      id="vision"
    >
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/2 left-[-100px] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-[-100px] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">
              Our Direction
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              Our{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Vision
            </span>
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto items-center">
          
          {/* Left - Narrative & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight mb-6 uppercase tracking-wide">
              Financial Empowerment
            </h3>
            <p className="text-lg leading-relaxed text-soft-gray group-hover:text-white font-light max-w-xl mb-10">
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
                  whileHover={{ y: -4, borderColor: "rgba(255, 154, 134, 0.4)" }}
                  className="relative p-5 rounded-xl border border-primary/[0.08] bg-[#0c0a10]/80 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{s.num}</div>
                  <div className="text-[10px] uppercase tracking-widest text-soft-gray font-bold mt-2">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Floating Holographic Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="relative h-72 rounded-2xl overflow-hidden border border-primary/[0.08] bg-[#0c0a10]/60 backdrop-blur-md flex flex-col items-center justify-center p-8 group transition-all duration-500 shadow-2xl cursor-default"
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-primary/[0.1] transition-all duration-500" />
            
            {/* Spinning decorative background sphere */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-44 h-44 rounded-full border border-primary/5 border-t-primary/20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-36 h-36 rounded-full border border-primary/5 border-b-primary/20" />
            </motion.div>

            {/* Glowing Logo */}
            <div className="relative mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/[0.08] to-transparent border border-primary/15 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(255,154,134,0.15)] transition-all duration-500">
              </div>
            </div>

            <span className="relative text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 opacity-60 select-none tracking-wider group-hover:opacity-90 transition-opacity">
              UIP GLOBAL
            </span>

            <div className="flex items-center gap-2 mt-4 text-[10px] text-soft-gray group-hover:text-primary uppercase tracking-[0.2em] font-bold transition-colors">
              <span>Enter Ecosystem</span>
              <ChevronDoubleRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* New premium card below the holographic card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "150px 0px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 w-full max-w-md mx-auto p-6 rounded-xl bg-[rgba(0,20,50,0.75)] backdrop-blur-xl border border-primary/30 hover:border-primary/60 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-center justify-center mb-4">
              </div>
              <h3 className="text-center text-xl font-bold text-white mb-2">Uniqueincomeplane</h3>
              <p className="text-center text-sm text-gray-300">Premium financial ecosystem offering multiple income streams, transparent payouts, and elite community support.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
