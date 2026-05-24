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
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
      style={{ background: 'linear-gradient(135deg, #050d1a 0%, #071428 30%, #0a1e30 60%, #1a1200 85%, #251600 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "center center"
        }}
      />

      {/* Teal/Cyan Glow (Top-Left) */}
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
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-50 blur-[100px] md:blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 180, 220, 0.45) 0%, rgba(0, 100, 160, 0) 70%)"
        }}
      />

      {/* Amber/Orange Glow (Bottom-Right) — the warm side in the reference */}
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
        className="absolute -bottom-[10%] -right-[5%] w-[65%] h-[65%] rounded-full opacity-55 blur-[100px] md:blur-[150px]"
        style={{
          background: "radial-gradient(circle, rgba(180, 90, 10, 0.65) 0%, rgba(100, 40, 0, 0) 70%)"
        }}
      />

      {/* Deep navy center ambient */}
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
        className="absolute top-[20%] left-[20%] w-[65%] h-[65%] rounded-full opacity-30 blur-[80px] md:blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 80, 120, 0.4) 0%, rgba(0, 40, 80, 0) 70%)"
        }}
      />

      {/* Soft dark vignette */}
      <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 5, 15, 0.5) 100%)' }} />
    </div>
  );
}
