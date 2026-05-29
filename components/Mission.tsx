"use client";

import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const highlights = [
  "Transparent smart contracts powered by community trust.",
  "Multi-source income streams for sustainable wealth.",
  "Community-first governance unlocking collective potential.",
];

export default function Mission() {
  return (
    <section 
      className="relative py-20 bg-transparent" 
      id="mission"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 right-[-100px] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-100px] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">
              Our Purpose
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              Our{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Mission
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

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 max-w-5xl mx-auto">
          
          {/* Left - Rotating Logo Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-64 h-64 relative flex items-center justify-center flex-shrink-0"
          >
            {/* Continuously Rotating Logo */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="relative w-44 h-44 rounded-full shadow-[0_0_60px_rgba(255,154,134,0.3)] flex items-center justify-center"
            >
              <img 
                src="https://anyimage.io/storage/uploads/724cca788e43d720d95babf4924908c3" 
                alt="UIP Circle Logo" 
                className="w-full h-full object-cover rounded-full"
              />
              
              {/* Outer rotating ring for extra dynamic effect */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[140%] h-[140%] rounded-full border border-white/5 border-t-primary/50 pointer-events-none" 
              />
            </motion.div>
          </motion.div>

          {/* Right - Mission highlights */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="flex-1"
          >
            <p className="text-xl text-soft-gray group-hover:text-white leading-relaxed mb-10 font-light max-w-2xl">
              Empower the next generation of creators and investors with a transparent, 
              community-driven income ecosystem that blends innovation, collective power, 
              and financial freedom.
            </p>
            
            <ul className="space-y-6">
              {highlights.map((h, i) => (
                <motion.li 
                  key={i} 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 text-white group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/[0.08] border border-primary/15 group-hover:border-primary/60 group-hover:bg-primary/10 transition-all duration-300 mt-0.5">
                    <ShieldCheckIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-soft-gray group-hover:text-white leading-relaxed transition-colors duration-300 max-w-xl font-medium">
                    {h}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
