"use client";

import { motion } from "framer-motion";
import { 
  SparklesIcon, 
  ChartBarSquareIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/outline";
import SectionNavArrow from "./SectionNavArrow";

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
      className="relative py-20 bg-transparent" 
      id="about"
    >
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

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
              <div className="h-[1px] w-8 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary bg-white/5 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
                About Us
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-white mb-6 leading-[1.1]">
              Redefining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                Your Income
              </span>
            </h2>

            <p className="text-lg md:text-xl font-display font-medium text-gray-300 leading-relaxed max-w-xl">
              A smart, transparent, and powerful plan — an opportunity to earn income from 
              multiple sources. We empower visionary individuals to build an unbreakable 
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent group-hover:via-[#f5c518]/70 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  
                  <div className="relative flex items-center gap-4 p-5 h-full rounded-2xl bg-[rgba(0,20,50,0.65)] backdrop-blur-xl border border-primary/20 group-hover:bg-[rgba(0,30,60,0.9)] group-hover:border-[#00d4ff] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]">
                    <div className="flex items-center justify-center min-w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#f5c518] shadow-[0_0_15px_rgba(0,212,255,0.25)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300">
                      <card.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display font-bold text-white group-hover:text-white transition-colors text-[15px] leading-snug tracking-wide">
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
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-primary via-secondary to-accent/40 shadow-[0_0_80px_rgba(0,212,255,0.25)] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/30 rounded-full mix-blend-overlay" />
              
              {/* Orbiting Ring 1 */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute w-[130%] h-[130%] rounded-full border-[1px] border-primary/10 border-t-primary/80 border-r-primary/30" 
              />
              
              {/* Orbiting Ring 2 */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute w-[160%] h-[160%] rounded-full border-[1px] border-accent/10 border-b-accent/50 border-l-primary/40" 
              />

              {/* Logo centered in the orb */}
              <motion.div 
                animate={{ rotateX: [0, 10, 0], rotateY: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-full h-full rounded-full flex items-center justify-center transform-gpu overflow-hidden"
              >
                <img src="https://anyimage.io/storage/uploads/8fd6fe1bd2aca6af620fedda10d3ee9a" alt="UIP Logo" className="w-full h-full object-cover rounded-full" style={{ transform: 'scale(1.2)' }} />
              </motion.div>

            </motion.div>
          </motion.div>

        </div>
      </div>
      <SectionNavArrow prev="#" next="#income" />
    </section>
  );
}
