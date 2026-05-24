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
      className="relative py-20 bg-transparent" 
      id="income"
    >
      {/* Ambient Glows */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] bg-secondary/[0.05] rounded-full blur-[140px] pointer-events-none" />

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
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              5 Types of{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Income
            </span>
          </h2>

          {/* Decorative underline */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
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
              {/* Card border glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:via-secondary/10 group-hover:to-highlight/20 transition-all duration-500 pointer-events-none" />

              <div className="relative p-8 h-full rounded-2xl bg-[#0c0a10]/80 border border-primary/[0.08] group-hover:border-primary/40 backdrop-blur-sm transition-all duration-500">
                
                {/* Top corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-primary/[0.12] transition-all duration-500" />
                
                {/* Bottom sweep line */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-primary via-secondary to-transparent transition-all duration-700 ease-out" />

                <div className="flex flex-col items-center space-y-5 relative z-10">
                  
                  {/* Icon */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/[0.08] to-highlight/[0.04] border border-primary/15 group-hover:border-primary/60 group-hover:shadow-[0_0_25px_rgba(255,154,134,0.2)] transition-all duration-500">
                      <item.icon className="w-7 h-7 text-primary/70 group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    {/* Glow dot behind icon */}
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/0 group-hover:bg-primary/10 blur-xl transition-all duration-500" />
                  </div>

                  {/* Title + Percent */}
                  <div className="text-center">
                    <h3 className="font-display font-black text-accent group-hover:text-secondary tracking-wider text-sm uppercase transition-colors duration-300">
                      {item.title}
                    </h3>
                    <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50 group-hover:text-primary bg-primary/[0.04] group-hover:bg-primary/[0.1] px-3 py-0.5 rounded-full border border-primary/10 group-hover:border-primary/30 transition-all duration-300">
                      {item.percent}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-soft-gray group-hover:text-white text-center leading-relaxed transition-colors duration-300">
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
