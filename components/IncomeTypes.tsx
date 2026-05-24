"use client";
import { motion } from "framer-motion";
import { 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  BanknotesIcon,
  TrophyIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

const incomeData = [
  { title: "Direct Income",       percent: "20%",            icon: ArrowTrendingUpIcon, desc: "Instantly earn 20% on every direct referral you bring into the ecosystem." },
  { title: "Weekly Income",         percent: "Up to 10 Levels", icon: ChartBarIcon,       desc: "Passive earnings scaled across 10 levels of your growing team network." },
  { title: "Level Income Plane",    percent: "Up to 10 Levels", icon: ChartBarIcon,       desc: "Passive earnings scaled across 10 levels of your growing team network." },
  { title: "Team Building Bonus", percent: "Extra",           icon: CubeTransparentIcon, desc: "Special bonuses unlocked as you hit key milestones in team size." },
  { title: "Team Salary",         percent: "Weekly",          icon: BanknotesIcon,       desc: "A stable, weekly recurring salary based on your rank and performance." },
  { title: "Awards & Rewards",    percent: "By Rank",         icon: TrophyIcon,          desc: "Luxury prizes, gadgets, and vehicles awarded for rank advancements." },
  { title: "Maintenance Bonus",   percent: "5%",              icon: WrenchScrewdriverIcon, desc: "Recurring income from the ongoing activity of your network." },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 150, damping: 18 } },
} as const;

export default function IncomeTypes() {
  return (
    <section 
      className="relative py-20 bg-transparent overflow-hidden" 
      id="income"
    >
      {/* Morphing Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.15, 0.08],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px]"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          {/* Label */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">
              Revenue Streams
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
              5 Types of{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              Income
            </span>
          </h2>

          {/* Decorative underline */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "150px 0px" }}
        >
          {incomeData.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
            >
              <div className="relative p-8 h-full rounded-2xl bg-[rgba(0,20,50,0.65)] border border-primary/20 group-hover:border-[#00d4ff] group-hover:bg-[rgba(0,30,60,0.85)] backdrop-blur-md transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(0,212,255,0.45)]">
                
                {/* Morphing gradient blob inside card */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] group-hover:bg-accent/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                
                {/* Top corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/[0.1] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-accent/[0.2] transition-all duration-500" />
                
                {/* Bottom sweep line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out" />

                <div className="flex flex-col items-center space-y-5 relative z-10">
                  
                  {/* Icon */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#f5c518] shadow-[0_0_15px_rgba(0,212,255,0.25)] group-hover:shadow-[0_0_25px_rgba(245,197,24,0.4)] transition-all duration-500 group-hover:-translate-y-1">
                      <item.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Title + Percent */}
                  <div className="text-center">
                    <h3 className="font-display font-bold text-white group-hover:text-primary tracking-wider text-[15px] uppercase transition-colors duration-300">
                      {item.title}
                    </h3>
                    <span className="inline-block mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#050505] bg-gradient-to-r from-primary to-accent px-4 py-1 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(245,197,24,0.5)]">
                      {item.percent}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 group-hover:text-white text-center leading-relaxed transition-colors duration-300">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
