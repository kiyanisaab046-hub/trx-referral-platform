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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#0b111e]">
      {/* 
        Grid / Mesh Pattern Overlay
        Provides that subtle high-tech, financial grid look 
      */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "center center"
        }}
      />

      {/* 
        Morphing Motion Graphic Glows 
        Using framer-motion for smooth, responsible animations
      */}

      {/* Main Cyan Glow (Top Left) */}
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
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-30 mix-blend-screen blur-[120px] md:blur-[180px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 210, 255, 0.8) 0%, rgba(0, 210, 255, 0) 70%)"
        }}
      />

      {/* Secondary Gold/Orange Glow (Bottom Right) */}
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
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full opacity-20 mix-blend-screen blur-[120px] md:blur-[180px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0) 70%)"
        }}
      />

      {/* Dynamic Deep Blue Center Morph */}
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
        className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-40 mix-blend-screen blur-[100px] md:blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 80, 255, 0.4) 0%, rgba(0, 80, 255, 0) 70%)"
        }}
      />

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b111e_100%)] opacity-80" />
    </div>
  );
}
