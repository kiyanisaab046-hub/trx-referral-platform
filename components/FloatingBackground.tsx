"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
      style={{ background: 'linear-gradient(180deg, #e84393 0%, #f78fb3 30%, #f8a5c2 45%, #f5c6aa 60%, #ffeaa7 85%, #fdfd96 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "center center"
        }}
      />

      {/* Morphing Pink Glow (Top) */}
      <motion.div
        animate={{
          x: ["-5%", "5%", "-5%"],
          y: ["-5%", "5%", "-5%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-40 mix-blend-screen blur-[120px] md:blur-[180px]"
        style={{
          background: "radial-gradient(circle, rgba(232, 67, 147, 0.7) 0%, rgba(232, 67, 147, 0) 70%)"
        }}
      />

      {/* Yellow/Gold Glow (Bottom) */}
      <motion.div
        animate={{
          x: ["5%", "-5%", "5%"],
          y: ["5%", "-5%", "5%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full opacity-30 mix-blend-screen blur-[120px] md:blur-[180px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 234, 167, 0.8) 0%, rgba(255, 234, 167, 0) 70%)"
        }}
      />

      {/* Warm Peach Center Morph */}
      <motion.div
        animate={{
          x: ["0%", "10%", "-10%", "0%"],
          y: ["10%", "-10%", "10%", "10%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-35 mix-blend-screen blur-[100px] md:blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(247, 143, 179, 0.5) 0%, rgba(245, 198, 170, 0) 70%)"
        }}
      />

      {/* Soft vignette */}
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(200, 100, 100, 0.15) 100%)' }} />
    </div>
  );
}
