"use client";
import { motion } from "framer-motion";
import {
  CogIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";

const features = [
  { title: "Simple Plan", description: "Easy onboarding, clear steps to get started in minutes.", icon: CogIcon },
  { title: "Unlimited Income", description: "No earning caps — grow as big as your team does.", icon: ArrowTrendingUpIcon },
  { title: "Global Opportunity", description: "Reach markets and members worldwide with no borders.", icon: GlobeAltIcon },
  { title: "Secure & Trusted", description: "Transparent system built on trust and clear rules.", icon: LockClosedIcon },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 150, damping: 18 } },
} as const;

export default function Features() {
  return (
    <section
      className="relative py-32 bg-gradient-to-b from-[#050505] via-[#080604] to-[#050505] overflow-hidden"
      id="features"
    >
      {/* Ambient glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#D4AF37]/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#C7913C]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-1.5 rounded-full border border-[#D4AF37]/20">
              Why Choose Us
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#e8e0cc] to-[#8a7a5a]">
              Key{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C]">
              Features
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

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "150px 0px" }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
            >
              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/15 group-hover:to-[#C7913C]/10 transition-all duration-500 pointer-events-none" />

              <div className="relative p-8 h-full rounded-2xl bg-[#0c0a08]/80 border border-[#D4AF37]/[0.08] group-hover:border-[#D4AF37]/40 backdrop-blur-sm transition-all duration-500">

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#D4AF37]/[0.05] to-transparent rounded-bl-3xl pointer-events-none group-hover:from-[#D4AF37]/[0.12] transition-all duration-500" />

                {/* Bottom sweep */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-transparent transition-all duration-700 ease-out" />

                {/* Number watermark */}
                <span className="absolute top-4 right-5 text-[#D4AF37]/[0.06] text-6xl font-display font-black pointer-events-none select-none group-hover:text-[#D4AF37]/[0.12] transition-all duration-500">
                  0{i + 1}
                </span>

                <div className="flex flex-col items-center space-y-5 relative z-10">
                  {/* Icon */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/[0.08] to-[#C7913C]/[0.04] border border-[#D4AF37]/15 group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-all duration-500">
                      <f.icon className="w-6 h-6 text-[#D4AF37]/70 group-hover:text-[#F5C542] transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 blur-xl transition-all duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-[#c9b896] group-hover:text-[#F5C542] tracking-wider text-sm uppercase transition-colors duration-300 text-center">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#8a7a5a] group-hover:text-[#c9b896] text-center leading-relaxed transition-colors duration-300">
                    {f.description}
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
