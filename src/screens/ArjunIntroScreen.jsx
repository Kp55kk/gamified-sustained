import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '../components/Particles';
import GlowOrb from '../components/GlowOrb';
import ArjunCharacter from '../components/ArjunCharacter';
import ComicBubble from '../components/ComicBubble';
import EnergyBar from '../components/EnergyBar';
import GameButton from '../components/GameButton';

const storyData = [
  { id: 1, text: "Hey! I'm Arjun! 👋", mood: "wave", pop: "WHOOSH!" },
  { id: 2, text: "I just came from science class and my mind is BLOWN 🤯", mood: "excited", pop: "BOOM!", popColor: "#f59e0b" },
  { id: 3, text: "My teacher said — every time we use electricity, a power plant burns coal...", mood: "thinking" },
  { id: 4, text: "...and releases 0.710 kg of CO₂ for EVERY single unit!", mood: "shocked", pop: "0.710 kg!", popColor: "#ef4444" },
  { id: 5, text: "Fans spinning. Fridge humming. AC blasting. I saw my house differently.", mood: "thinking" },
  { id: 6, text: "How much CO₂ is MY home producing? 🤔", mood: "thinking" },
  { id: 7, text: "I'm going to find out. And I'm going to FIX it.", mood: "determined", pop: "POWER UP!", popColor: "#22c55e" },
  { id: 8, text: "Will you join my mission? 🚀", mood: "hero", pop: "HERO MODE ACTIVATED!", popColor: "#f59e0b" }
];

const ArjunIntroScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const currentStory = storyData[step];
  const isLast = step === storyData.length - 1;

  const handleNext = () => {
    if (isLast) navigate('/video');
    else setStep(s => s + 1);
  };

  const getOrbColor = (mood) => {
    if (mood === 'excited' || mood === 'hero') return '#f59e0b';
    if (mood === 'shocked') return '#ef4444';
    if (mood === 'determined') return '#22c55e';
    return '#3b82f6';
  };

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050a15] z-10 p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <Particles count={30} />
      <GlowOrb color={getOrbColor(currentStory.mood)} size="50vw" delay={0} opacity={0.3} />

      <AnimatePresence>
         {currentStory.mood === 'hero' && (
           <motion.div className="absolute inset-0 mix-blend-screen z-0 pointer-events-none" style={{ backgroundColor: '#f59e0b' }} initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} />
         )}
      </AnimatePresence>

      {/* Comic Pop Layer (Absolute Position Top) */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center">
        <AnimatePresence mode="wait">
           {currentStory.pop && (
              <motion.div
                key={currentStory.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1.2, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-4xl md:text-[48px] italic font-black text-center"
                style={{ 
                  fontFamily: 'Fredoka, sans-serif', 
                  color: currentStory.popColor || '#ffffff', 
                  WebkitTextStroke: '2px #000',
                  textShadow: '3px 3px 0 #000'
                }}
              >
                {currentStory.pop}
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center gap-2 mt-4">
        {/* Thought Bubble - Max 80px */}
        <div className="h-[80px] flex items-end justify-center w-full relative z-30">
           <ComicBubble text={currentStory.text} key={`bubble-${currentStory.id}`} />
        </div>

        {/* Character - Max 140px */}
        <motion.div className="relative z-20" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
           <div 
             className="relative flex items-center justify-center rounded-full border-4 backdrop-blur-sm transition-colors duration-500"
             style={{ 
               backgroundColor: 'rgba(5, 10, 21, 0.5)', 
               borderColor: getOrbColor(currentStory.mood),
               boxShadow: `0 0 20px ${getOrbColor(currentStory.mood)}60` 
             }}
           >
             <ArjunCharacter mood={currentStory.mood} size={140} />
           </div>
           
           {/* Name Tag - Small */}
           <div 
             className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 border px-3 py-1 rounded-full z-30 bg-[#050a15]"
             style={{ borderColor: '#22c55e', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
           >
             <span className="font-bold tracking-widest uppercase text-xs" style={{ fontFamily: 'Fredoka, sans-serif', color: '#22c55e' }}>Arjun</span>
           </div>
        </motion.div>

        {/* Energy Bar - 6px margins */}
        <div className="w-full my-2 relative z-30">
           <EnergyBar progress={((step + 1) / storyData.length) * 100} height="6px" showSegments={true} baseColor="#22c55e" />
        </div>

        {/* Audio Visualizer Placeholder - 16px */}
        <div className="flex items-center gap-2 opacity-60 mb-2 mt-1 z-30">
           <div className="flex items-center gap-[2px] h-4">
              {[2, 4, 8, 12, 6, 10, 3].map((h, i) => (
                <motion.div 
                  key={i} 
                  className="w-[3px] bg-white rounded-full" 
                  animate={{ height: [`${h}px`, `16px`, `${h}px`] }} 
                  transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" }} 
                />
              ))}
           </div>
           <span className="text-[10px] tracking-widest uppercase italic font-bold" style={{ color: '#9ca3af', fontFamily: 'Nunito, sans-serif' }}>Voice processing</span>
        </div>

        {/* Button */}
        <motion.div key={`btn-${isLast}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full z-30">
          <GameButton onClick={handleNext} color={isLast ? 'golden' : '#22c55e'} isHero={isLast}>
            {isLast ? "ACTIVATE HERO MODE!" : "NEXT MISSION →"}
          </GameButton>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default ArjunIntroScreen;
