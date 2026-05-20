"use client";

import { motion } from "framer-motion";

const milestones = [
  { phase: "Phase 1", title: "Inception",         detail: "Launch of the core ecosystem and community protocol." },
  { phase: "Phase 2", title: "Network Expansion",  detail: "Global outreach and multi-currency wallet integration." },
  { phase: "Phase 3", title: "AI Integration",     detail: "Deployment of automated distribution and analytics tools." },
  { phase: "Phase 4", title: "Ecosystem Maturity", detail: "Full governance and equity distribution among top leaders." },
];

export default function Timeline() {
  return (
    <section 
      className="relative py-32 bg-gradient-to-b from-[#050505] via-[#080604] to-[#050505] overflow-hidden" 
      id="roadmap"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-1.5 rounded-full border border-[#D4AF37]/20">
              Roadmap
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">
              The{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C]">
              Success
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">
              {" "}Formula
            </span>
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center"
          />
        </motion.div>

        {/* Timeline Path */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical gold line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-[#D4AF37]/40 via-[#C7913C]/20 to-transparent hidden md:block" />

          <div className="space-y-16">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "150px 0px" }}
                transition={{ duration: 0.5, delay: i * 0.05, type: "spring", stiffness: 120, damping: 15 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Content block */}
                <div className={`md:w-1/2 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} group cursor-default`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl border border-[#D4AF37]/[0.08] bg-[#0c0a08]/80 backdrop-blur-sm group-hover:border-[#D4AF37]/30 transition-all duration-300 shadow-xl"
                  >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/[0.06] border border-[#D4AF37]/20 rounded-md mb-4">
                      {m.phase}
                    </span>
                    <h3 className="text-xl font-display font-black text-[#c9b896] group-hover:text-[#F5C542] uppercase tracking-wide mb-2 transition-colors duration-300">
                      {m.title}
                    </h3>
                    <p className="text-sm text-[#8a7a5a] group-hover:text-[#c9b896] leading-relaxed transition-colors duration-300">
                      {m.detail}
                    </p>
                  </motion.div>
                </div>

                {/* Nodes on middle path */}
                <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C7913C] border-4 border-[#050505] shadow-[0_0_20px_rgba(212,175,55,0.6)] hidden md:block flex-shrink-0" />

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
