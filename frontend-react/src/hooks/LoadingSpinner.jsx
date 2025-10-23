import React from "react";
import { motion } from "framer-motion";

/**
 * LoadingSpinner
 * Props:
 *  - size: number (px) default 64
 *  - stroke: stroke width default 6
 *  - color: tailwind-like color string for stroke (e.g. "blue-400") or any CSS color
 *  - text: optional loading text
 */
export default function LoadingSpinner({ size = 64, stroke = 6, color = "#60A5FA", text = "Memuat..." }) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* wrapper untuk rotasi kontainer */}
      <motion.div
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        className="inline-block"
      >
        {/* SVG spinner */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          {/* background ring (faint) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />

          {/* animated dash ring */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.65 + " " + circumference}
            strokeDashoffset={0}
            // animate the dash offset to create traveling dash effect
            animate={{ strokeDashoffset: [0, -circumference * 0.65, -circumference * 1.3] }}
            transition={{ repeat: Infinity, repeatType: "loop", duration: 1.2, ease: "linear" }}
          />
        </svg>
      </motion.div>

      {/* inner subtle pulse */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: [0.9, 1.02, 0.95], opacity: [0.6, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="text-sm text-blue-400"
        aria-live="polite"
      >
        {text}
      </motion.div>
    </div>
  );
}
