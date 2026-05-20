"use client";
import { motion } from "framer-motion";
import { 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

const incomes = [
  { label: "Direct Income", pct: "20%", icon: ArrowTrendingUpIcon, accent: "from-[#D4AF37] to-[#F5C542]" },
  { label: "Level Income",  pct: "30%", icon: ChartBarIcon,        accent: "from-[#C7913C] to-[#D4AF37]" },
  { label: "Team Income",   pct: "5%",  icon: UserGroupIcon,       accent: "from-[#8B6914] to-[#C7913C]" },
];

export default function EarningPotential() {
  return (
    <section 
      className="relative py-32 bg-gradient-to-b from-[#050505] via-[#070604] to-[#050505] overflow-hidden" 
      id="earning-potential"
    >
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-1.5 rounded-full border border-[#D4AF37]/20">
              Income Breakdown
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-6xl md:text-7xl">
              55%
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">
              Total Earning Potential
            </span>
          </h2>

          <p className="mt-6 text-[#8a7a5a] max-w-lg mx-auto text-lg font-light leading-relaxed">
            Every plan combines three income layers to maximise your returns.
          </p>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center"
          />
        </motion.div>

        {/* Income Cards */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16 max-w-4xl mx-auto">
          {incomes.map((inc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "150px 0px" }}
              transition={{ delay: i * 0.08, duration: 0.4, type: "spring", stiffness: 150, damping: 18 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="group flex-1 relative rounded-2xl overflow-hidden cursor-default"
            >
              {/* Animated top border glow */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${inc.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-10 h-full rounded-2xl bg-[#0c0a08]/80 border border-[#D4AF37]/[0.08] group-hover:border-[#D4AF37]/40 backdrop-blur-sm transition-all duration-500">
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/[0.04] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-[#D4AF37]/[0.1] transition-all duration-500" />
                
                {/* Icon */}
                <div className="relative mx-auto mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/[0.08] to-[#C7913C]/[0.04] border border-[#D4AF37]/15 group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500 mx-auto">
                    <inc.icon className="w-7 h-7 text-[#D4AF37]/70 group-hover:text-[#F5C542] transition-colors duration-300" />
                  </div>
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 blur-xl transition-all duration-500" />
                </div>

                {/* Percentage */}
                <div className={`text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r ${inc.accent} mb-3`}>
                  {inc.pct}
                </div>

                {/* Label */}
                <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a7a5a] group-hover:text-[#c9b896] transition-colors duration-300">
                  {inc.label}
                </div>

                {/* Bottom sweep */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-transparent transition-all duration-700 ease-out" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Formula Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap px-6 py-4 rounded-2xl bg-[#0c0a08]/60 border border-[#D4AF37]/10">
            <span className="font-display font-bold text-[#c9b896] text-sm tracking-wide">20% Direct</span>
            <span className="text-[#D4AF37]/40 font-bold">+</span>
            <span className="font-display font-bold text-[#c9b896] text-sm tracking-wide">30% Level</span>
            <span className="text-[#D4AF37]/40 font-bold">+</span>
            <span className="font-display font-bold text-[#c9b896] text-sm tracking-wide">5% Team</span>
            <span className="text-[#D4AF37]/40 font-bold">=</span>
            <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5C542] text-2xl">55%</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
