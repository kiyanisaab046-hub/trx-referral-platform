"use client";
import { motion } from "framer-motion";
import { SparklesIcon, StarIcon, BoltIcon, RocketLaunchIcon, FireIcon, CubeTransparentIcon, ShieldCheckIcon, TrophyIcon, CpuChipIcon } from "@heroicons/react/24/outline";

const ranks = [
  { id: "01", name: "Starter", price: "$3", icon: SparklesIcon },
  { id: "02", name: "Builder", price: "$6", icon: StarIcon },
  { id: "03", name: "Grower", price: "$12", icon: BoltIcon },
  { id: "04", name: "Achiever", price: "$24", icon: RocketLaunchIcon },
  { id: "05", name: "Advancer", price: "$48", icon: FireIcon },
  { id: "06", name: "Progressor", price: "$96", icon: CubeTransparentIcon },
  { id: "07", name: "Leader", price: "$192", icon: ShieldCheckIcon },
  { id: "08", name: "Pioneer", price: "$384", icon: TrophyIcon },
  { id: "09", name: "Champion", price: "$768", icon: CpuChipIcon },
  { id: "10", name: "Legend", price: "$1,536", icon: FireIcon },
];

export default function Ranks() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-[#050505] via-[#0A0A0A] to-[#050505] overflow-hidden" id="ranks">
      <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "150px 0px" }} transition={{ duration: 0.6 }} className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">Rank System</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">Professional </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">Pack Ranks</span>
          </h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center" />
        </motion.div>

        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-primary/[0.08] bg-[#0c0a08]/80 backdrop-blur-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-primary/20 bg-gradient-to-r from-primary/[0.03] via-primary/[0.06] to-primary/[0.03]">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">ID</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Rank Name</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-highlight">Package Price</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-[0.3em] text-accent text-center">Badge</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((rank, i) => (
                  <motion.tr key={rank.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "150px 0px" }} transition={{ delay: i * 0.03, duration: 0.3 }} className="group border-b border-white/[0.04] hover:bg-primary/[0.03] transition-all duration-300 cursor-default">
                    <td className="p-5"><span className="font-mono text-sm text-soft-gray group-hover:text-white transition-colors duration-300">{rank.id}</span></td>
                    <td className="p-5"><span className="font-display font-black text-soft-gray group-hover:text-highlight uppercase tracking-wider text-sm transition-colors duration-300">{rank.name}</span></td>
                    <td className="p-5"><span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-lg tracking-tight">{rank.price}</span></td>
                    <td className="p-5 text-center">
                      <motion.div whileHover={{ scale: 1.15, rotate: 8 }} transition={{ type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/[0.08] to-secondary/[0.04] border border-primary/15 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_rgba(255,154,134,0.15)] transition-all duration-300">
                        <rank.icon className="w-5 h-5 text-primary/60 group-hover:text-accent transition-colors duration-300" />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
