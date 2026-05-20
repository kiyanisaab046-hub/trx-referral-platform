"use client";

import { motion } from "framer-motion";
import { 
  SparklesIcon, 
  ChartBarSquareIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/outline";

const cards = [
  { title: "Smart & Transparent", icon: SparklesIcon, delay: 0.1 },
  { title: "5 Types of Income",   icon: ChartBarSquareIcon, delay: 0.2 },
  { title: "Team Power",          icon: UserGroupIcon, delay: 0.3 },
  { title: "Long-Term Stability", icon: ShieldCheckIcon, delay: 0.4 },
  { title: "Financial Freedom",   icon: PaperAirplaneIcon, delay: 0.5 },
];

export default function About() {
  return (
    <section 
      className="relative py-32 overflow-hidden bg-gradient-to-b from-[#050505] via-[#0A0514] to-[#050505]" 
      id="about"
    >
      {/* Deep Amethyst and Gold Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:w-1/2"
          >
            {/* Premium Section Label */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-gradient-to-r from-[#D4AF37] to-transparent" />
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37] bg-white/5 px-3 py-1 rounded-full border border-[#D4AF37]/20 backdrop-blur-sm">
                About Us
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 leading-[1.1]">
              Redefining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#C7913C] drop-shadow-lg">
                Your Income
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-12 leading-relaxed font-light max-w-xl">
              A highly intelligent, completely transparent plan designed to generate revenue through 
              multiple dynamic sources. We empower visionary individuals to build an unbreakable 
              financial foundation.
            </p>

            {/* Glassmorphism Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "150px 0px" }}
                  transition={{ delay: card.delay * 0.5, duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-[1px] rounded-2xl overflow-hidden"
                >
                  {/* Animated Border Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent group-hover:via-[#D4AF37] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  
                  <div className="relative flex items-center gap-4 p-5 h-full rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 group-hover:bg-white/[0.05] group-hover:border-[#D4AF37]/40 transition-all duration-300 shadow-2xl">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300">
                      <card.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-display font-bold text-gray-200 group-hover:text-white transition-colors text-sm uppercase tracking-wider">
                      {card.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — 3D Glass Orb Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2 relative h-[500px] flex items-center justify-center group"
          >
            {/* Core glowing sphere */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#C7913C] to-purple-600/40 shadow-[0_0_100px_rgba(212,175,55,0.3)] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/20 rounded-full mix-blend-overlay" />
              
              {/* Orbiting Ring 1 */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[130%] h-[130%] rounded-full border-[1px] border-white/10 border-t-[#D4AF37]/80 border-r-[#D4AF37]/30" 
              />
              
              {/* Orbiting Ring 2 */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute w-[160%] h-[160%] rounded-full border-[1px] border-white/5 border-b-purple-400/50 border-l-[#D4AF37]/40" 
              />

              {/* Floating Glass Plate in the center */}
              <motion.div 
                animate={{ rotateX: [0, 10, 0], rotateY: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-44 h-44 rounded-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center transform-gpu"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />
                <span className="relative font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 text-5xl tracking-tighter drop-shadow-lg">
                  UIP
                </span>
                <div className="relative mt-3 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  <span className="text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase font-bold">
                    Since 2024
                  </span>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
