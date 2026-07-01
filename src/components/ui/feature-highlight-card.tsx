"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureHighlightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  index?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

export const FeatureHighlightCard = React.forwardRef<
  HTMLDivElement,
  FeatureHighlightCardProps
>(({ icon, title, description, className, index = 0 }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E8F2F5] bg-white p-8 shadow-sm",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Subtle top glow */}
      <div className="absolute left-1/2 top-0 z-0 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />

      {/* Icon */}
      <motion.div
        variants={itemVariants}
        className="relative z-10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200"
        style={{ backgroundColor: 'rgba(11,143,172,0.15)' }}
        whileHover={{ backgroundColor: 'rgba(11,143,172,0.28)' }}
      >
        <div className="text-brand-ink">{icon}</div>
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={itemVariants}
        className="relative z-10 mb-3 text-[17px] font-bold tracking-tight text-text-primary"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="relative z-10 text-[14px] leading-relaxed text-[#6B7280]"
      >
        {description}
      </motion.p>

      {/* Bottom accent line */}
      <motion.div
        variants={itemVariants}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left"
        style={{ background: 'linear-gradient(90deg, var(--brand) 0%, transparent 100%)' }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
      />
    </motion.div>
  );
});

FeatureHighlightCard.displayName = "FeatureHighlightCard";