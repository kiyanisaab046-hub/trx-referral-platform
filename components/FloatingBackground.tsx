"use client";

import { useEffect, useState } from "react";
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

export default function FloatingBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Determine if viewport width is sufficient for particles (disable on mobile <768px)
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    if (!isDesktop) return;
    // Generate a reduced set of 6 particles for better performance
    const generated = Array.from({ length: 6 }).map((_, i) => {
      const Icon = icons[Math.floor(Math.random() * icons.length)];
      const size = Math.random() * 20 + 15; // 15px to 35px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 12 + 12; // 12s to 24s (shorter)
      const delay = Math.random() * -24; // negative delay to start immediately at random points
      return { id: i, Icon, size, left, duration, delay };
    });
    setParticles(generated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="floating-bg-container">
      <style>{`
        .floating-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .luxury-center-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 154, 134, 0.03) 0%, transparent 70%);
        }

        .floating-particle {
          position: absolute;
          bottom: -50px;
          color: var(--color-primary);
          opacity: 0;
          will-change: transform, opacity;
          animation: floatUp linear infinite;
          filter: drop-shadow(0 0 2px rgba(255, 154, 134, 0.2));
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-particle {
            animation-duration: 5s !important;
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.05;
          }
          90% {
            opacity: 0.05;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="luxury-center-glow" />
      
      {particles.map((p) => {
        const IconComponent = p.Icon;
        return (
          <div
            key={p.id}
            className="floating-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <IconComponent className="w-full h-full" />
          </div>
        );
      })}
    </div>
  );
}
