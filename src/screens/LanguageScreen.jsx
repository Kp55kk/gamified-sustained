import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Particles from '../components/Particles';
import GlowOrb from '../components/GlowOrb';

const languages = [
  { id: 'en', english: 'English', native: 'English', char: 'E', color: '#3b82f6' },
  { id: 'hi', english: 'Hindi', native: 'हिन्दी', char: 'हि', color: '#f59e0b' },
  { id: 'ta', english: 'Tamil', native: 'தமிழ்', char: 'த', color: '#22c55e' },
  { id: 'te', english: 'Telugu', native: 'తెలుగు', char: 'తె', color: '#a855f7' },
  { id: 'kn', english: 'Kannada', native: 'ಕನ್ನಡ', char: 'ಕ', color: '#ec4899' },
  { id: 'ml', english: 'Malayalam', native: 'മലയാളം', char: 'മ', color: '#3b82f6' },
  { id: 'mr', english: 'Marathi', native: 'मराठी', char: 'म', color: '#ef4444' },
  { id: 'bn', english: 'Bengali', native: 'বাংলা', char: 'বা', color: '#f59e0b' },
  { id: 'gu', english: 'Gujarati', native: 'ગુજરાતી', char: 'ગુ', color: '#22c55e' },
  { id: 'pa', english: 'Punjabi', native: 'ਪੰਜਾਬੀ', char: 'ਪ', color: '#a855f7' },
];

const containerVariants = { show: { transition: { staggerChildren: 0.05 } }, hidden: {} };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

const LanguageScreen = () => {
  const navigate = useNavigate();
  const { setSelectedLanguage } = useGame();
  const [clickedId, setClickedId] = useState(null);

  const handleSelect = (lang) => {
    setClickedId(lang.id);
    setSelectedLanguage(lang.id);
    setTimeout(() => { navigate('/age'); }, 600);
  };

  return (
    <motion.div 
      className="w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-[#050a15] z-10 p-2"
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.6 }}
    >
      <Particles count={20} />
      <GlowOrb color="#3b82f6" size="50vw" opacity={0.2} delay={0} />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border flex items-center gap-2 mb-2"
          style={{ borderColor: 'rgba(34,197,94,0.5)', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
          <span className="uppercase tracking-widest text-[10px] font-bold text-[#22c55e]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Step 1 of 3</span>
        </motion.div>

        <motion.h1 
          className="text-3xl md:text-5xl mb-1 text-center font-bold tracking-wide text-white"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          Pick Your Language <span role="img" aria-label="speak">🗣️</span>
        </motion.h1>
        
        <motion.p className="text-gray-400 mb-6 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Choose the language you think in
        </motion.p>

        <motion.div className="grid grid-cols-2 lg:grid-cols-5 gap-3 w-full px-4" variants={containerVariants} initial="hidden" animate="show">
          {languages.map((lang) => {
            const isClicked = clickedId === lang.id;
            return (
              <motion.button
                key={lang.id}
                variants={itemVariants}
                whileHover={!clickedId ? { scale: 1.02, y: -2 } : {}}
                whileTap={!clickedId ? { scale: 0.98 } : {}}
                onClick={() => !clickedId && handleSelect(lang)}
                className="relative group w-full text-left overflow-hidden rounded-xl border-l-[3px] transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  borderLeftColor: lang.color,
                  borderRight: '1px solid transparent',
                  borderTop: '1px solid transparent',
                  borderBottom: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = `inset 200px 0 100px -100px ${lang.color}20, 0 4px 15px rgba(0,0,0,0.5)`;
                  e.currentTarget.style.borderColor = lang.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderRightColor = 'transparent';
                  e.currentTarget.style.borderTopColor = 'transparent';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                <AnimatePresence>
                  {isClicked && <motion.div className="absolute inset-0 bg-white z-20" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.4 }} />}
                </AnimatePresence>

                <div className="p-3 flex items-center justify-between relative z-10 w-full">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${lang.color}, ${lang.color}80)` }}
                    >
                      <span className="text-lg font-bold text-white drop-shadow-md">{lang.char}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold tracking-wide text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>{lang.native}</span>
                      <span className="text-gray-400 text-xs uppercase tracking-wider" style={{ fontFamily: 'Nunito, sans-serif' }}>{lang.english}</span>
                    </div>
                  </div>
                  
                  {/* Sliding Arrow */}
                  <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                     <span className="text-xl font-bold" style={{ color: lang.color }}>→</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};
export default LanguageScreen;
