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
      className="relative py-20 bg-transparent" 
      id="roadmap"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[180px] pointer-events-none" />

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
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">
              Roadmap
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              The{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Success
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              {" "}Formula
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

        {/* Timeline Path */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical gold line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent hidden md:block" />

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
                    className="p-6 rounded-2xl border border-primary/[0.08] bg-[#0c0a10]/80 backdrop-blur-sm group-hover:border-primary/30 transition-all duration-300 shadow-xl"
                  >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/[0.06] border border-primary/20 rounded-md mb-4">
                      {m.phase}
                    </span>
                    <h3 className="text-xl font-display font-black text-accent group-hover:text-secondary uppercase tracking-wide mb-2 transition-colors duration-300">
                      {m.title}
                    </h3>
                    <p className="text-sm text-soft-gray group-hover:text-white leading-relaxed transition-colors duration-300">
                      {m.detail}
                    </p>
                  </motion.div>
                </div>

                {/* Nodes on middle path */}
                <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-highlight border-4 border-[#050505] shadow-[0_0_20px_rgba(255,154,134,0.6)] hidden md:block flex-shrink-0" />

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
