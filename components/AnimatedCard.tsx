"use client";

import { motion } from "framer-motion";

interface AnimatedCardProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title, icon, description, children, className, style,
}) => {
  return (
      <motion.div
        whileHover={{ y: -8, scale: 1.04, rotate: 3 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`group relative p-8 bg-[#050505] border border-primary/20 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 ${className || ""}`}
        style={style}
      >
        <div className="absolute top-3 right-4 text-primary/20 group-hover:text-primary/50 transition-colors text-lg select-none">♛</div>
        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="text-4xl text-primary/80 group-hover:text-primary transition-colors">{icon}</div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-primary tracking-wide text-center uppercase transition-colors">
            {title}
          </h3>
          {description && <p className="text-sm text-[#BFBFBF] text-center leading-relaxed">{description}</p>}
          {children && <div className="text-sm text-[#BFBFBF] text-center">{children}</div>}
        </div>
        <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-primary transition-all duration-500" />
      </motion.div>
  );
};

export default AnimatedCard;
