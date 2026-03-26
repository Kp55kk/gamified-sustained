import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ArjunCharacter = ({ mood = "wave", size = 140 }) => {
  const getAvatarState = (mood) => {
    switch (mood) {
      case "wave":
        return { eyebrows: "M-35,-15 Q-20,-20 -5,-15 M5,-15 Q20,-20 35,-15", mouth: "M-15,5 Q0,20 15,5", eyes: 'normal', arm: 'wave', sparks: false, auraPulse: 4, capeRot: 5, auraSize: 1.1 };
      case "excited":
        return { eyebrows: "M-35,-25 Q-20,-30 -5,-20 M5,-20 Q20,-30 35,-25", mouth: "M0,15 A10,10 0 1,0 0,14.9", eyes: 'huge', arm: 'down', sparks: true, auraPulse: 1.5, capeRot: 15, auraSize: 1.3 };
      case "thinking":
        return { eyebrows: "M-35,-15 Q-20,-10 -5,-15 M5,-25 Q20,-20 35,-15", mouth: "M-5,10 L5,10", eyes: 'lookLeft', arm: 'thinking', sparks: false, auraPulse: 4, capeRot: 2, auraSize: 1.1 };
      case "shocked":
        return { eyebrows: "M-35,-30 L-5,-20 M5,-20 L35,-30", mouth: "M0,10 A15,15 0 1,0 0,9.9", eyes: 'massive', arm: 'down', sparks: false, flash: true, auraPulse: 0.5, capeRot: -10, auraSize: 1.2 };
      case "determined":
        return { eyebrows: "M-35,-15 L-5,-5 M5,-5 L35,-15", mouth: "M-20,10 L20,10", eyes: 'narrow', arm: 'down', sparks: false, auraPulse: 1, capeRot: 10, auraSize: 1.2 };
      case "hero":
        return { eyebrows: "M-35,-20 L-5,-10 M5,-10 L35,-20", mouth: "M-20,5 Q0,15 20,5", eyes: 'glow', arm: 'hero', sparks: false, hero: true, auraPulse: 0.8, capeRot: 25, auraSize: 1.4 };
      default:
        return { eyebrows: "M-35,-15 Q-20,-20 -5,-15 M5,-15 Q20,-20 35,-15", mouth: "M-15,5 Q0,20 15,5", eyes: 'normal', arm: 'down', sparks: false, auraPulse: 4, capeRot: 5, auraSize: 1.1 };
    }
  };

  const state = getAvatarState(mood);

  return (
    <motion.div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background Shock Flash */}
      <AnimatePresence>
        {state.flash && (
          <motion.div 
            initial={{ scale: 0, opacity: 1 }} 
            animate={{ scale: 2, opacity: 0 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.8 }} 
            className="absolute z-0 inset-0 rounded-full"
            style={{ backgroundColor: '#ef4444' }}
          />
        )}
      </AnimatePresence>

      {/* Hero Golden Pulse */}
      <AnimatePresence>
        {state.hero && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0.8 }} 
            animate={{ scale: 1.8, opacity: 0 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 1.5, repeat: Infinity }} 
            className="absolute z-0 inset-0 rounded-full border-4"
            style={{ borderColor: '#f59e0b' }}
          />
        )}
      </AnimatePresence>

      {/* Pulsing Green Aura */}
      <motion.div 
        className="absolute w-full h-full rounded-full z-0"
        style={{ backgroundColor: '#22c55e', opacity: 0.2 }}
        animate={{ scale: [1, state.auraSize, 1] }}
        transition={{ duration: state.auraPulse, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Super Hero SVG */}
      <svg width={size} height={size} viewBox="0 0 200 200" className="z-10 relative overflow-visible drop-shadow-xl">
        <defs>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
            <stop offset="40%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Animated Cape Behind Body */}
        <g transform="translate(100, 120)">
          <motion.path 
            d="M-40,0 L-60,70 L-20,60 Z" fill="#22c55e" 
            animate={{ rotate: [-state.capeRot, state.capeRot, -state.capeRot] }} 
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
            style={{ originX: '0px', originY: '0px' }}
          />
          <motion.path 
            d="M40,0 L60,70 L20,60 Z" fill="#22c55e" 
            animate={{ rotate: [state.capeRot, -state.capeRot, state.capeRot] }} 
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} 
            style={{ originX: '0px', originY: '0px' }}
          />
        </g>

        {/* Arms Behind Wait - Thinking Arm / Wave Arm */}
        <g transform="translate(100, 130)">
          {state.arm === 'wave' && (
             <motion.path d="M40,-10 Q70,-40 80,-80 L60,-80 Q50,-40 40,0 Z" fill="#A0784C" animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.5, repeat: Infinity }} />
          )}
        </g>

        {/* Body Trapezoid */}
        <g transform="translate(100, 160)">
          <path d="M-40,40 L-30,-40 L30,-40 L40,40 Z" fill="#ffffff" stroke="#ddd" strokeWidth="2" />
          {/* Emblem on Chest */}
          <g transform="translate(0, -15)">
            <polygon points="0,-15 15,-5 15,5 0,15 -15,5 -15,-5" fill="#22c55e" />
            <path d="M2,-10 L-8,2 L0,2 L-2,10 L8,-2 L0,-2 Z" fill="#fff" />
          </g>
        </g>

        {/* Arm Overlaps (Thinking) */}
        <g transform="translate(100, 130)">
          {state.arm === 'thinking' && (
             <path d="M-40,0 Q-60,30 -30,60 Q0,40 -20,-30 Z" fill="#A0784C" />
          )}
          {state.arm === 'hero' && (
             <>
               <path d="M-40,0 Q-60,20 -45,40 Q-20,20 -40,0" fill="#A0784C" />
               <path d="M40,0 Q60,20 45,40 Q20,20 40,0" fill="#A0784C" />
             </>
          )}
        </g>

        {/* Head */}
        <circle cx="100" cy="80" r="45" fill="#A0784C" />

        {/* Hair - Spiky Anime Path */}
        <path d="M55,80 Q50,40 100,20 Q95,40 115,10 Q110,40 135,15 Q125,40 150,30 Q130,50 145,80 Q100,30 55,80 Z" fill="#111" />

        {/* Face Elements */}
        <g transform="translate(100, 85)">
          {/* Eyebrows */}
          <motion.path d={state.eyebrows} fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" animate={{ d: state.eyebrows }} transition={{ duration: 0.2 }} />

          {/* Left Eye */}
          <g transform="translate(-18, 0)">
            {state.eyes !== 'narrow' && <ellipse cx="0" cy="0" rx={state.eyes === 'huge' || state.eyes === 'massive' ? 12 : 9} ry={state.eyes === 'massive' ? 18 : (state.eyes === 'huge' ? 14 : 11)} fill="#fff" />}
            {state.eyes === 'narrow' && <ellipse cx="0" cy="0" rx="10" ry="4" fill="#fff" />}
            
            <circle cx={state.eyes === 'lookLeft' ? -3 : 0} cy={state.eyes === 'lookLeft' ? -3 : 0} r={state.eyes === 'massive' ? 8 : (state.eyes === 'narrow' ? 3 : 5)} fill={state.eyes === 'glow' ? "url(#eyeGlow)" : "#22c55e"} />
            
            {/* Anime Sparkle Dots */}
            {state.eyes !== 'narrow' && state.eyes !== 'glow' && <circle cx={state.eyes === 'lookLeft' ? -1 : 3} cy={state.eyes === 'lookLeft' ? -5 : -4} r={state.eyes === 'massive' ? 3 : 2} fill="#fff" />}
          </g>

          {/* Right Eye */}
          <g transform="translate(18, 0)">
            {state.eyes !== 'narrow' && <ellipse cx="0" cy="0" rx={state.eyes === 'huge' || state.eyes === 'massive' ? 12 : 9} ry={state.eyes === 'massive' ? 18 : (state.eyes === 'huge' ? 14 : 11)} fill="#fff" />}
            {state.eyes === 'narrow' && <ellipse cx="0" cy="0" rx="10" ry="4" fill="#fff" />}
            
            <circle cx={state.eyes === 'lookLeft' ? -3 : 0} cy={state.eyes === 'lookLeft' ? -3 : 0} r={state.eyes === 'massive' ? 8 : (state.eyes === 'narrow' ? 3 : 5)} fill={state.eyes === 'glow' ? "url(#eyeGlow)" : "#22c55e"} />
            
            {state.eyes !== 'narrow' && state.eyes !== 'glow' && <circle cx={state.eyes === 'lookLeft' ? -1 : 3} cy={state.eyes === 'lookLeft' ? -5 : -4} r={state.eyes === 'massive' ? 3 : 2} fill="#fff" />}
          </g>

          {/* Mouth */}
          <motion.path d={state.mouth} fill={state.mouth.includes('A') ? "#111" : "none"} stroke="#111" strokeWidth="3" strokeLinecap="round" animate={{ d: state.mouth }} transition={{ duration: 0.2 }} />
        </g>
      </svg>

      {/* Excited Sparks */}
      <AnimatePresence>
        {state.sparks && (
          <motion.div className="absolute inset-0 pointer-events-none z-20">
             {[0, 60, 120, 180, 240, 300].map(deg => (
                <motion.div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
                  style={{ transform: `rotate(${deg}deg) translateX(70px)` }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: deg / 300 }}
                />
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ArjunCharacter;
