import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  green: '#22c55e',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899'
};

const HexNode = ({ status = 'locked', icon = '🔒', title, color = 'blue', onClick }) => {
  const isUnlocked = status === 'unlocked' || status === 'completed';
  const colorHex = colorMap[color];
  const isCurrent = status === 'unlocked';
  
  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.1, translateY: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`relative group flex flex-col items-center justify-center m-1 w-24 h-32`}
      style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
    >
      <div className="relative w-20 h-24 flex items-center justify-center">
        {/* Orbiting Particles for Unlocked State */}
        <AnimatePresence>
          {isCurrent && (
             <motion.div 
               className="absolute inset-[-10px] pointer-events-none"
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             >
                <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full shadow-[0_0_8px_#fff]" style={{ backgroundColor: colorHex, transform: 'translate(-50%, -50%)' }} />
                <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#fff]" style={{ backgroundColor: colorHex, transform: 'translate(-50%, 50%)' }} />
             </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Glow Background */}
        {isCurrent && (
           <motion.div 
             className="absolute inset-[5px] rounded-full blur-md opacity-60 z-0"
             style={{ backgroundColor: colorHex }}
             animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
           />
        )}

        {/* Main SVG Hexagon */}
        <svg width="80" height="90" viewBox="0 0 100 115" className={`z-10 drop-shadow-lg ${!isUnlocked ? 'grayscale opacity-70' : ''}`}>
           {/* Outer Stroke */}
           <polygon 
             points="50,5 95,28 95,82 50,105 5,82 5,28" 
             fill={isUnlocked ? '#0a1628' : '#1f2937'} 
             stroke={isUnlocked ? colorHex : '#4b5563'} 
             strokeWidth="4" 
           />
           {/* Inner Gradient fill */}
           <polygon 
             points="50,11 89,31 89,78 50,99 11,78 11,31" 
             fill={isUnlocked ? colorHex : '#374151'} 
             opacity={isUnlocked ? 0.2 : 0.5} 
           />
           
           {/* Locked State: Chains & Lock */}
           {!isUnlocked && (
             <>
               <path d="M 0,30 L 100,80 M 0,80 L 100,30" stroke="#111" strokeWidth="8" strokeDasharray="10, 5" opacity="0.6" />
               <rect x="40" y="45" width="20" height="15" rx="2" fill="#6b7280" stroke="#111" strokeWidth="2" />
               <path d="M 45,45 V 35 A 5,5 0 0,1 55,35 V 45" fill="none" stroke="#6b7280" strokeWidth="3" />
               <circle cx="50" cy="52" r="2" fill="#111" />
             </>
           )}
        </svg>

        {/* Icon inside */}
        {isUnlocked && (
           <div className="absolute inset-0 flex items-center justify-center z-20">
             <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{icon}</span>
           </div>
        )}
      </div>
      
      {/* Title */}
      <div 
        className="text-center text-[10px] whitespace-nowrap px-2 mt-1 z-20 font-bold"
        style={{ fontFamily: 'Fredoka, sans-serif', color: isUnlocked ? '#ffffff' : '#9ca3af' }}
      >
        {title}
      </div>

      {/* Pulsing Start Text */}
      {isCurrent && (
        <motion.div 
          className="absolute -bottom-4 text-[9px] font-black px-2 py-0.5 rounded backdrop-blur-sm shadow-md whitespace-nowrap z-30"
          style={{ color: '#fff', backgroundColor: colorHex, fontFamily: 'Nunito, sans-serif' }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          TAP TO START
        </motion.div>
      )}
    </motion.div>
  );
};

export default HexNode;
