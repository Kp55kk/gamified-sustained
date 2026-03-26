import React from 'react';
import { motion } from 'framer-motion';

const EnergyBar = ({ progress = 0, duration = 0.5, height = "12px", showSegments = false, baseColor = "#22c55e" }) => {
  return (
    <div className="w-full bg-black/40 rounded-full overflow-hidden border border-white/10" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration, ease: "easeInOut" }}
        style={{
          backgroundColor: baseColor,
          boxShadow: showSegments ? undefined : `0 0 10px ${baseColor}`,
          backgroundImage: showSegments ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)` : undefined
        }}
      />
    </div>
  );
};

export default EnergyBar;
