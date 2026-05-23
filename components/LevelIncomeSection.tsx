"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon, PresentationChartLineIcon, UsersIcon, CurrencyDollarIcon, SparklesIcon } from "@heroicons/react/24/outline";

// Data from the provided level income system image
const levelData = [
  { level: 1, team: 2, income30: 1.8, totalIncome: 1.8, packages: 3 },
  { level: 2, team: 4, income30: 7.2, totalIncome: 9.0, packages: 6 },
  { level: 3, team: 8, income30: 28.8, totalIncome: 37.8, packages: 12 },
  { level: 4, team: 16, income30: 115.2, totalIncome: 153.6, packages: 24 },
  { level: 5, team: 32, income30: 460.8, totalIncome: 613.0, packages: 48 },
  { level: 6, team: 64, income30: 1843.2, totalIncome: 2456.2, packages: 96 },
  { level: 7, team: 128, income30: 7372.8, totalIncome: 9829.0, packages: 192 },
  { level: 8, team: 256, income30: 29491.2, totalIncome: 39320.2, packages: 384 },
  { level: 9, team: 512, income30: 117964.8, totalIncome: 157284.8, packages: 768 },
  { level: 10, team: 1024, income30: 471859.2, totalIncome: 629144.0, packages: 1536 },
];

const cards = [
  {
    title: "Secure",
    description: "Safe, Transparent & Reliable",
    icon: ShieldCheckIcon,
  },
  {
    title: "Unlimited",
    description: "Unlimited Income Potential",
    icon: PresentationChartLineIcon,
  },
  {
    title: "Team",
    description: "Build Your Team, Grow Globally",
    icon: UsersIcon,
  },
  {
    title: "Passive",
    description: "Earn Passive Income Everyday",
    icon: CurrencyDollarIcon,
  },
];

export default function LevelIncomeSection() {
  const [multiplier, setMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<"table" | "calculator">("table");

  // Format currency values nicely
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: val % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#050505] via-[#0A0A0A] to-[#050505] overflow-hidden" id="level-income">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-black uppercase tracking-[0.35em] text-primary bg-primary/10 px-5 py-1.5 rounded-full border border-primary/20">
              Unique Income Plane
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1] mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-highlight to-secondary">
              Passive Income{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              System
            </span>
          </h2>

          <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full shadow-lg backdrop-blur-md mb-6">
            <span className="text-sm font-bold uppercase tracking-wider text-accent">Level Income</span>
            <span className="font-mono text-lg font-black text-primary">30%</span>
          </div>

          <p className="text-soft-gray max-w-xl mx-auto text-sm md:text-base font-medium">
            Grow Your Team — Multiply Your Income
          </p>

          <motion.div 
            initial={{ scaleX: 0 }} 
            whileInView={{ scaleX: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: 0.3 }} 
            className="mx-auto mt-8 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center" 
          />
        </motion.div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "table"
                ? "bg-gradient-to-r from-primary to-secondary text-black shadow-md shadow-primary/20 scale-105"
                : "border border-primary/20 hover:border-primary/50 text-soft-gray hover:text-white"
            }`}
          >
            Level Matrix Table
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "calculator"
                ? "bg-gradient-to-r from-primary to-secondary text-black shadow-md shadow-primary/20 scale-105"
                : "border border-primary/20 hover:border-primary/50 text-soft-gray hover:text-white"
            }`}
          >
            Earnings Calculator
          </button>
        </div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-primary/10 bg-[#0C0A08]/90 backdrop-blur-md shadow-2xl relative"
            >
              {/* Table Header Glow decoration */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-primary/20 bg-primary/[0.03]">
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.25em] text-primary text-center">Level</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.25em] text-secondary">Team Size</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.25em] text-highlight">30% Income</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.25em] text-accent">Total Income</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-[0.25em] text-primary text-right">Required Packages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelData.map((row, i) => (
                      <motion.tr 
                        key={row.level}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-300"
                      >
                        <td className="p-5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-black font-mono group-hover:border-primary group-hover:text-black group-hover:bg-primary transition-all duration-300">
                            {row.level}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="font-display font-black text-white text-base tracking-wide">
                            {row.team.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="font-mono text-base font-bold text-highlight">
                            {formatCurrency(row.income30)}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-white text-lg">
                            {formatCurrency(row.totalIncome)}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <span className="font-mono text-sm text-soft-gray bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/[0.06] group-hover:border-primary/30 transition-all duration-300">
                            {row.packages} Pack
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto rounded-3xl p-8 border border-secondary/15 bg-[#0C0A08]/95 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              {/* Interactive background glow */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
              
              <h3 className="text-xl font-display font-black uppercase text-center mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Team Growth Simulator
              </h3>

              <p className="text-xs text-soft-gray text-center mb-8">
                Adjust the team size scale below to see how earnings grow exponentially across the levels with a 30% return system!
              </p>

              {/* Slider Input */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-secondary">Referral Growth Multiplier</span>
                  <span className="font-mono font-black text-lg text-primary">{multiplier}x Team</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-primary focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #FF9A86 0%, #FFB399 ${(multiplier - 1) * 11}%, rgba(255,255,255,0.1) ${(multiplier - 1) * 11}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {/* Outputs Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-xs font-bold text-soft-gray uppercase tracking-wider">Simulated Total Team Size</span>
                  <span className="font-display font-black text-xl text-white">
                    {(1024 * multiplier).toLocaleString()} Members
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Estimated Level 10 Income</span>
                  <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    {formatCurrency(471859.2 * multiplier)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-xs font-bold text-soft-gray uppercase tracking-wider">Estimated Cumulative Income</span>
                  <span className="font-display font-black text-2xl text-accent">
                    {formatCurrency(629144.0 * multiplier)}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <SparklesIcon className="w-3.5 h-3.5" /> High yield geometric potential
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Cards Features underneath */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-24">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, borderColor: "rgba(255, 154, 134, 0.4)", boxShadow: "0 12px 30px rgba(255, 154, 134, 0.08)" }}
              className="p-6 rounded-2xl border border-white/[0.05] bg-[#0C0A08]/80 backdrop-blur-md hover:bg-white/[0.01] transition-all duration-300 flex flex-col items-center text-center group cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 group-hover:border-primary/50 group-hover:scale-110 flex items-center justify-center mb-4 transition-all duration-300">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-display font-black uppercase text-white tracking-widest mb-2">
                {card.title}
              </h4>
              <p className="text-[11px] text-soft-gray font-semibold leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* WORK SMART • GROW FAST • EARN BIG */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-center mt-20"
        >
          <p className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            Work Smart • Grow Fast • Earn Big
          </p>
        </motion.div>

      </div>
    </section>
  );
}
