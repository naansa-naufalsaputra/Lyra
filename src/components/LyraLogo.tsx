import React from "react";
import { motion } from "framer-motion";

interface LyraLogoProps {
  className?: string;
  size?: number;
}

export function LyraLogo({ className = "", size = 32 }: LyraLogoProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
    >
      {/* Background Glow */}
      <circle cx="16" cy="16" r="14" fill="url(#logo-gradient)" fillOpacity="0.15" />
      
      {/* Lyre / Harp Shape - Elegant Curved Design */}
      <motion.path
        d="M8 6C8 6 8 22 16 26C24 22 24 6 24 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-primary opacity-20"
      />
      
      {/* Strings */}
      {[12, 15, 18, 21].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 6V${x > 16 ? 26 - (x-16)*1.5 : 22 + (x-10)*0.5}`}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-accent"
          animate={{
            opacity: [0.6, 1, 0.6],
            strokeWidth: [2, 2.5, 2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Top Bar */}
      <path
        d="M6 6H26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-accent"
      />

      <defs>
        <linearGradient
          id="logo-gradient"
          x1="16"
          y1="4"
          x2="16"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
