import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Particles from '../components/Particles';
import GlowOrb from '../components/GlowOrb';
import { KidIcon, TeenIcon } from '../components/AgeIcons';
import GameButton from '../components/GameButton';

const AgeScreen = () => {
  const navigate = useNavigate();
  const { setAgeGroup } = useGame();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSelect = (track) => {
    setAgeGroup(track);
    navigate('/intro');
  };

  return (
    <motion.div 
      className="w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-[#050a15] z-10 p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.6 }}
    >
      <Particles count={30} />
      <GlowOrb color="#22c55e" size="40vw" left="20%" top="30%" delay={0} opacity={0.2} />
      <GlowOrb color="#3b82f6" size="40vw" left="80%" top="70%" delay={1} opacity={0.2} />

      {/* Global CSS for rotating gradient border */}
      <style>{`
        @keyframes rotateGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-border {
          background-size: 200% 200%;
          animation: rotateGradient 3s ease infinite;
        }
      `}</style>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center justify-center h-full">
        
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border flex items-center gap-2 mb-2"
          style={{ borderColor: 'rgba(34,197,94,0.5)', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
          <span className="uppercase tracking-widest text-[10px] font-bold text-[#22c55e]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Step 2 of 3</span>
        </motion.div>

        <motion.h1 
          className="text-3xl md:text-5xl mb-1 text-center font-bold tracking-wide text-white"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          Choose Your Track <span role="img" aria-label="game">🎮</span>
        </motion.h1>
        
        <motion.p className="text-gray-400 mb-6 text-center text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Both tracks start from zero — pick your class group
        </motion.p>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl flex-1 max-h-[60vh]">
          
          {/* SSLC Track Card */}
          <motion.div
             onMouseEnter={() => setHoveredCard('sslc')}
             onMouseLeave={() => setHoveredCard(null)}
             className="relative flex-1 rounded-2xl p-[3px] group h-full cursor-pointer"
             whileHover={{ y: -8 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Animated Gradient Border Layer */}
            <div 
              className={`absolute inset-0 rounded-2xl animated-gradient-border transition-opacity duration-300 ${hoveredCard === 'sslc' ? 'opacity-100' : 'opacity-50'}`} 
              style={{ backgroundImage: 'linear-gradient(60deg, #166534, #22c55e, #166534)', filter: hoveredCard === 'sslc' ? 'blur(8px)' : 'blur(2px)' }} 
            />
            
            <div className="relative h-full bg-[#0a1628] rounded-[14px] flex flex-col items-center justify-between p-6 z-10 overflow-hidden">
               <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[#22c55e]/20 to-transparent" />
               
               <div className="z-10 flex flex-col items-center">
                  <div className="mb-4">
                     <KidIcon size={100} isHovered={hoveredCard === 'sslc'} />
                  </div>
                  
                  <h2 className="text-3xl text-white font-bold tracking-wide text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>Classes 6 – 10</h2>
                  <div className="mt-2 mb-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]">
                    SSLC TRACK
                  </div>
                  <p className="text-gray-300 italic text-center text-sm h-12">"Visual learning • Guided exploration • Step-by-step discovery"</p>
               </div>

               <div className="w-full z-10 mt-4">
                  <GameButton onClick={() => handleSelect('sslc')} color="#22c55e" className="group-hover:animate-pulse shadow-[0_0_15px_#22c55e]">
                     SELECT →
                  </GameButton>
               </div>
            </div>
          </motion.div>

          {/* HSC Track Card */}
          <motion.div
             onMouseEnter={() => setHoveredCard('hsc')}
             onMouseLeave={() => setHoveredCard(null)}
             className="relative flex-1 rounded-2xl p-[3px] group h-full cursor-pointer"
             whileHover={{ y: -8 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Animated Gradient Border Layer */}
            <div 
              className={`absolute inset-0 rounded-2xl animated-gradient-border transition-opacity duration-300 ${hoveredCard === 'hsc' ? 'opacity-100' : 'opacity-50'}`} 
              style={{ backgroundImage: 'linear-gradient(60deg, #1e3a8a, #3b82f6, #1e3a8a)', filter: hoveredCard === 'hsc' ? 'blur(8px)' : 'blur(2px)' }} 
            />
            
            <div className="relative h-full bg-[#0a1628] rounded-[14px] flex flex-col items-center justify-between p-6 z-10 overflow-hidden">
               <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[#3b82f6]/20 to-transparent" />
               
               <div className="z-10 flex flex-col items-center">
                  <div className="mb-4">
                     <TeenIcon size={100} isHovered={hoveredCard === 'hsc'} />
                  </div>
                  
                  <h2 className="text-3xl text-white font-bold tracking-wide text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>Classes 11 – 12</h2>
                  <div className="mt-2 mb-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]">
                    HSC TRACK
                  </div>
                  <p className="text-gray-300 italic text-center text-sm h-12">"Deeper analysis, calculations & real-world design"</p>
               </div>

               <div className="w-full z-10 mt-4">
                  <GameButton onClick={() => handleSelect('hsc')} color="#3b82f6" className="group-hover:animate-pulse shadow-[0_0_15px_#3b82f6]">
                     SELECT →
                  </GameButton>
               </div>
            </div>
          </motion.div>

        </div>

        <motion.div className="mt-4 text-[10px] font-semibold tracking-wider flex items-center gap-1 opacity-80 text-[#f59e0b]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span>⚡</span> Both tracks start from the very beginning
        </motion.div>
      </div>
    </motion.div>
  );
};
export default AgeScreen;
