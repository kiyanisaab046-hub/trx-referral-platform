"use client";
import { motion } from "framer-motion";

const levels = [...Array(15)].map((_, i) => {
  const lvl = i + 1;
  const pct = lvl === 1 ? 20 : lvl <= 5 ? 5 : lvl <= 10 ? 2 : 1;
  return { lvl, pct };
});

export default function LevelIncomeTable() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-[#050505] via-[#080604] to-[#050505] overflow-hidden" id="level-income-table">
      <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-[#C7913C]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "150px 0px" }} transition={{ duration: 0.6 }} className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-1.5 rounded-full border border-[#D4AF37]/20">Level System</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">Level </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C]">Income Table</span>
          </h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center" />
        </motion.div>

        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-[#D4AF37]/[0.08] bg-[#0c0a08]/80 backdrop-blur-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/[0.06] via-[#D4AF37]/[0.1] to-[#D4AF37]/[0.06]">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Level</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Income %</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] hidden sm:table-cell">Unlock Condition</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] text-center">Tier</th>
                </tr>
              </thead>
              <tbody>
                {levels.map(({ lvl, pct }, i) => {
                  const tier = lvl === 1 ? "★★★" : lvl <= 5 ? "★★" : lvl <= 10 ? "★" : "·";
                  return (
                    <motion.tr key={lvl} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "150px 0px" }} transition={{ delay: i * 0.02, duration: 0.25 }} className="group border-b border-[#D4AF37]/[0.06] hover:bg-[#D4AF37]/[0.04] transition-all duration-300 cursor-default">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-[#8a7a5a]/60 w-6">{lvl.toString().padStart(2, "0")}</span>
                          <div className="px-3 py-1 rounded-lg border border-[#D4AF37]/[0.1] bg-[#D4AF37]/[0.03] font-display font-bold uppercase text-xs tracking-wider text-[#c9b896] group-hover:border-[#D4AF37]/40 group-hover:text-[#F5C542] transition-all duration-300">
                            Level {lvl}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5C542] text-xl tracking-tight">{pct}%</span>
                      </td>
                      <td className="p-5 hidden sm:table-cell">
                        <span className="text-xs font-medium text-[#8a7a5a] uppercase tracking-widest group-hover:text-[#c9b896] transition-colors duration-300">Rank {Math.ceil(lvl / 2)}+</span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="text-[#D4AF37]/50 group-hover:text-[#F5C542] text-sm tracking-widest transition-colors duration-300">{tier}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
