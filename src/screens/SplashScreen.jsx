import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '../components/Particles';
import GlowOrb from '../components/GlowOrb';
import ArjunCharacter from '../components/ArjunCharacter';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoadingComplete(true);
          return 100;
        }
        return prev + (100 / 35);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout;
    if (loadingComplete) {
      timeout = setTimeout(() => { handleStart(); }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [loadingComplete, navigate]);

  const handleStart = () => { navigate('/language'); };

  return (
    <motion.div 
      className="w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-[#050a15] z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0, transformPerspective: 1000, originX: 0 }}
      transition={{ duration: 0.8, ease: "anticipate" }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Particles count={30} />
      <GlowOrb color="#22c55e" size="40vw" delay={0} opacity={0.3} />

      <div className="z-10 flex flex-col items-center justify-center relative w-full h-full max-w-2xl text-center px-4">
        
        {/* Main Logo Area containing Globe and Arjun */}
        <div className="flex items-end justify-center mb-6 relative">
          <motion.div 
            className="relative flex justify-center items-center w-32 h-32 md:w-40 md:h-40 z-20"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: '#22c55e', boxShadow: '0 0 15px rgba(34,197,94,0.5)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <div 
              className="absolute inset-[4px] flex items-center justify-center bg-[#050a15]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
               <span className="text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">🌍</span>
            </div>
            <motion.div
              className="absolute inset-0 border-2 rounded-full border-[#22c55e]"
              animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          {/* New Superhero Arjun Insert */}
          <motion.div 
            className="absolute -right-8 bottom-0 z-30" 
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
             <ArjunCharacter mood="hero" size={80} />
          </motion.div>
        </div>

        <motion.h1 
          className="text-5xl md:text-7xl mb-2 text-transparent bg-clip-text font-bold tracking-wide animate-pulse"
          style={{ fontFamily: 'Fredoka, sans-serif', backgroundImage: 'linear-gradient(to right, #22c55e, #ffffff, #22c55e)' }}
        >
          BUILD TO INSPIRE
        </motion.h1>

        <motion.p className="text-gray-400 uppercase tracking-[0.3em] font-semibold mb-12 text-[10px] md:text-xs">
          Save the Planet. One Home at a Time.
        </motion.p>

        <div className="w-full max-w-sm h-20 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="popLayout">
            {!loadingComplete ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <div className="mb-2 text-[10px] uppercase tracking-wider text-center flex justify-between font-bold" style={{ color: '#22c55e', fontFamily: 'Fredoka, sans-serif' }}>
                  <span>Initializing Mission...</span><span>{Math.floor(progress)}%</span>
                </div>
                {/* Advanced Loading Bar with Energy Particles */}
                <div className="w-full h-[6px] bg-black/40 rounded-full border border-white/10 relative overflow-hidden">
                   <motion.div
                     className="h-full rounded-full bg-[#22c55e] relative overflow-hidden"
                     style={{ width: `${progress}%`, boxShadow: '0 0 10px #22c55e' }}
                   >
                     {/* Flowing Energy Effect Inside Bar */}
                     <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                   </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="start" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                <button
                  onClick={handleStart}
                  className="w-full py-3 text-xl font-bold tracking-wide text-white border-2 backdrop-blur-md rounded-lg transition-all duration-300 hover:scale-[1.03] active:scale-95"
                  style={{ fontFamily: 'Fredoka, sans-serif', borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', boxShadow: '0 0 15px rgba(34,197,94,0.5), inset 0 0 10px rgba(34,197,94,0.2)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.2)'; }}
                >
                  <span className="animate-pulse flex items-center justify-center gap-2">PRESS START <span className="text-xl">🚀</span></span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
