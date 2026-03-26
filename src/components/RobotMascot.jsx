import React from 'react';
import { motion } from 'framer-motion';

const RobotMascot = ({ size = 100 }) => {
  return (
    <motion.div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="5" stroke="#9ca3af" strokeWidth="4" />
        <circle cx="50" cy="5" r="5" fill="#ef4444" className="animate-pulse" />
        
        {/* Body */}
        <rect x="25" y="60" width="50" height="30" rx="5" fill="#e5e7eb" />
        {/* Energy Core */}
        <circle cx="50" cy="75" r="8" fill="#22c55e" className="animate-pulse" />

        {/* Head */}
        <rect x="20" y="20" width="60" height="45" rx="10" fill="#f3f4f6" />
        
        {/* Screen */}
        <rect x="25" y="25" width="50" height="30" rx="5" fill="#111827" />
        
        {/* Eyes (Happy curves) */}
        <path d="M 35 35 Q 40 30 45 35" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <path d="M 55 35 Q 60 30 65 35" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        
        {/* Smile */}
        <path d="M 40 45 Q 50 50 60 45" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />

        {/* Floating Arms */}
        <motion.circle cx="10" cy="70" r="5" fill="#9ca3af" animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.circle cx="90" cy="70" r="5" fill="#9ca3af" animate={{ y: [2, -2, 2] }} transition={{ duration: 1, repeat: Infinity }} />
      </svg>
    </motion.div>
  );
};

export default RobotMascot;
