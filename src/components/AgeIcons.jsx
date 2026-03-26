import React from 'react';
import { motion } from 'framer-motion';

export const KidIcon = ({ size = 80, isHovered = false }) => (
  <motion.svg 
    width={size} height={size} viewBox="0 0 100 100" 
    animate={isHovered ? { y: [-5, 0, -5] } : { y: 0 }}
    transition={{ duration: 0.5, repeat: Infinity }}
    className="drop-shadow-lg"
  >
    {/* Round Face */}
    <circle cx="50" cy="50" r="40" fill="#fcd34d" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#b45309" strokeWidth="4" />
    {/* Big Eyes */}
    <circle cx="35" cy="45" r="8" fill="#111" />
    <circle cx="37" cy="43" r="3" fill="#fff" />
    <circle cx="65" cy="45" r="8" fill="#111" />
    <circle cx="67" cy="43" r="3" fill="#fff" />
    {/* Smile */}
    <path d="M 30,65 Q 50,85 70,65" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
    {/* Blush */}
    <ellipse cx="25" cy="55" rx="6" ry="4" fill="#fb923c" opacity="0.6" />
    <ellipse cx="75" cy="55" rx="6" ry="4" fill="#fb923c" opacity="0.6" />
    {/* Hair spikes */}
    <path d="M 20,25 L 30,10 L 40,20 L 50,5 L 60,20 L 70,10 L 80,25" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

export const TeenIcon = ({ size = 80, isHovered = false }) => (
  <motion.svg 
    width={size} height={size} viewBox="0 0 100 100" 
    animate={isHovered ? { y: [-5, 0, -5] } : { y: 0 }}
    transition={{ duration: 0.5, repeat: Infinity }}
    className="drop-shadow-lg"
  >
    {/* Sharp Face */}
    <path d="M 20,30 L 80,30 L 75,70 L 50,90 L 25,70 Z" fill="#93c5fd" />
    <path d="M 20,30 L 80,30 L 75,70 L 50,90 L 25,70 Z" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinejoin="round" />
    {/* Smaller Eyes */}
    <path d="M 30,45 L 45,45" stroke="#111" strokeWidth="5" strokeLinecap="round" />
    <path d="M 55,45 L 70,45" stroke="#111" strokeWidth="5" strokeLinecap="round" />
    {/* Smirk */}
    <path d="M 40,65 Q 50,75 60,60" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    {/* Glasses */}
    <rect x="25" y="38" width="22" height="14" rx="2" fill="none" stroke="#111" strokeWidth="3" />
    <rect x="53" y="38" width="22" height="14" rx="2" fill="none" stroke="#111" strokeWidth="3" />
    <line x1="47" y1="45" x2="53" y2="45" stroke="#111" strokeWidth="3" />
    {/* Sharp Hair */}
    <path d="M 15,30 L 30,5 L 45,15 L 60,5 L 75,20 L 85,30" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);
