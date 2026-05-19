"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  SparklesIcon,
  StarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  BanknotesIcon,
  WalletIcon,
  GiftIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

const icons = [
  SparklesIcon, StarIcon, CurrencyDollarIcon, TrophyIcon, 
  BanknotesIcon, WalletIcon, GiftIcon, CreditCardIcon
];

function generateRandomConfig() {
  // Pick a random icon
  const Icon = icons[Math.floor(Math.random() * icons.length)];
  const size = Math.random() * 25 + 15; // 15px to 40px
  
  // Decide which of the 4 edges it starts from
  const edge = Math.floor(Math.random() * 4);
  let startX, startY, endX, endY;
  
  // Random coordinates for crossing the screen
  const randomCrossPos1 = Math.random() * 100;
  const randomCrossPos2 = Math.random() * 100;
  
  if (edge === 0) { // Start Top, go Bottom
    startX = randomCrossPos1 + "vw";
    startY = "-10vh";
    endX = randomCrossPos2 + "vw";
    endY = "110vh";
  } else if (edge === 1) { // Start Right, go Left
    startX = "110vw";
    startY = randomCrossPos1 + "vh";
    endX = "-10vw";
    endY = randomCrossPos2 + "vh";
  } else if (edge === 2) { // Start Bottom, go Top
    startX = randomCrossPos1 + "vw";
    startY = "110vh";
    endX = randomCrossPos2 + "vw";
    endY = "-10vh";
  } else { // Start Left, go Right
    startX = "-10vw";
    startY = randomCrossPos1 + "vh";
    endX = "110vw";
    endY = randomCrossPos2 + "vh";
  }

  // Fast speed: 4s to 12s per full screen cross
  const duration = Math.random() * 8 + 4; 
  
  // Random rotation direction
  const rotationTarget = Math.random() > 0.5 ? 360 : -360;

  return { Icon, size, startX, startY, endX, endY, duration, rotationTarget, key: Math.random() };
}

function FloatingParticle({ delay }: { delay: number }) {
  const [config, setConfig] = useState<any>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Generate initial config
    setConfig(generateRandomConfig());
    
    // Start after the staggered delay
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);

  // If not started yet, don't render
  if (!started || !config) return null;

  return (
    <motion.div
      // Changing the key forces framer-motion to completely restart with the new config
      key={config.key}
      className="absolute top-0 left-0 text-[#D4AF37] opacity-[0.06]"
      initial={{ x: config.startX, y: config.startY, rotate: 0 }}
      animate={{ x: config.endX, y: config.endY, rotate: config.rotationTarget }}
      transition={{ duration: config.duration, ease: "linear" }}
      // When it goes off-screen, generate a completely new icon/path!
      onAnimationComplete={() => setConfig(generateRandomConfig())}
      style={{ width: config.size, height: config.size }}
    >
      <config.Icon 
        className="w-full h-full" 
        style={{ filter: "drop-shadow(0 0 3px rgba(212,175,55,0.15))" }} 
      />
    </motion.div>
  );
}

export default function FloatingBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration errors by only rendering on client
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Render 45 particles for a dense luxury feel
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Subtle luxury glow in the center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(212,175,55,0.03)] via-transparent to-transparent"></div>
      
      {Array.from({ length: 20 }).map((_, i) => (
        // Stagger the initial start times so they don't all spawn at once
        <FloatingParticle key={i} delay={Math.random() * 5} />
      ))}
    </div>
  );
}
