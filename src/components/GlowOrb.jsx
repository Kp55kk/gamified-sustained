import React from 'react';
import { motion } from 'framer-motion';

const GlowOrb = ({ color = "#22c55e", top = "50%", left = "50%", size = "300px", delay = 0, opacity = 0.4 }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none mix-blend-screen"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        top,
        left,
        transform: 'translate(-50%, -50%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [opacity - 0.1, opacity + 0.1, opacity - 0.1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay
      }}
    />
  );
};

export default GlowOrb;
