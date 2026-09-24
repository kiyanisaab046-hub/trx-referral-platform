"use client";

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
      <div
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-30 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 180, 220, 0.45) 0%, rgba(0, 100, 160, 0) 70%)"
        }}
      />

      {/* Amber/Orange Glow (Bottom-Right) */}
      <div
        className="absolute -bottom-[10%] -right-[5%] w-[65%] h-[65%] rounded-full opacity-30 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(180, 90, 10, 0.65) 0%, rgba(100, 40, 0, 0) 70%)"
        }}
      />

      {/* Deep navy center ambient */}
      <div
        className="absolute top-[20%] left-[20%] w-[65%] h-[65%] rounded-full opacity-20 blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 80, 120, 0.4) 0%, rgba(0, 40, 80, 0) 70%)"
        }}
      />

      {/* Soft dark vignette */}
      <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 5, 15, 0.5) 100%)' }} />
    </div>
  );
}
