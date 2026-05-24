"use client";

import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Create Account",  description: "Register on our platform using a referral link or through our secure gateway." },
  { number: "02", title: "Select Package",   description: "Choose the investment tier that aligns with your financial goals and potential." },
  { number: "03", title: "Activate & Earn",  description: "Initialize your plan and start receiving multi-source income instantly." },
  { number: "04", title: "Build & Scale",    description: "Share the vision, grow your network, and unlock exponential earning levels." },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 150, damping: 18 } },
} as const;

export default function HowToJoin() {
  return (
    <section 
      className="relative py-20 bg-transparent" 
      id="join"
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-[-100px] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-secondary/[0.03] rounded-full blur-[130px] pointer-events-none" />

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
              Get Started
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              How To{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Join
            </span>
          </h2>
          <p className="mt-6 text-soft-gray max-w-lg mx-auto text-lg font-light leading-relaxed">
            Starting your journey to financial freedom is a seamless 4-step process.
          </p>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
          />
        </motion.div>

        {/* Steps Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "150px 0px" }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
            >
              {/* Card border glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/15 group-hover:to-secondary/10 transition-all duration-500 pointer-events-none" />

              <div className="relative p-8 h-full rounded-2xl bg-[#0c0a10]/80 border border-primary/[0.08] group-hover:border-primary/40 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between">
                
                {/* Step Number Watermark */}
                <div className="text-5xl font-display font-black text-primary/[0.08] group-hover:text-primary/[0.2] transition-colors duration-500 mb-6">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-accent group-hover:text-secondary uppercase tracking-wider mb-3 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm text-soft-gray group-hover:text-white leading-relaxed transition-colors duration-300">
                    {step.description}
                  </p>
                </div>

                {/* Bottom line sweep */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-primary via-secondary to-transparent transition-all duration-700 ease-out" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <motion.a
            href="#register"
            whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(255,154,134,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-primary via-secondary to-highlight text-[#050505] text-base font-display font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_20px_rgba(255,154,134,0.2)]"
          >
            Get Started Now
          </motion.a>
        </div>
      </div>
    </section>
  );
}
