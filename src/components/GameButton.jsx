import React from 'react';
import { motion } from 'framer-motion';

const GameButton = ({ children, onClick, color = "#22c55e", isHero = false, className = "" }) => {
  const isGolden = color === 'golden';
  const glowColor = isGolden ? '#f59e0b' : color;
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden w-full ${className}`}
      style={isHero ? { animation: 'shake 0.5s infinite' } : {}}
    >
      <div 
        className="absolute inset-0 bg-white/20 transition-transform duration-500 ease-in-out transform -translate-x-full hover:translate-x-full" 
        style={{ transform: 'skewX(-20deg)' }}
      />
      
      <div 
        className="flex items-center justify-center px-4 py-3 rounded-lg border backdrop-blur-md text-base md:text-lg font-bold tracking-wide transition-all duration-300"
        style={{
          fontFamily: 'Fredoka, sans-serif',
          borderColor: glowColor,
          background: isGolden ? 'linear-gradient(to right, #eab308, #f59e0b)' : `${color}33`,
          boxShadow: `0 0 10px rgba(0,0,0,0.5)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 15px ${glowColor}80, inset 0 0 10px ${glowColor}33`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 10px rgba(0,0,0,0.5)`;
        }}
      >
        {children}
      </div>
    </motion.button>
  );
};

export default GameButton;
