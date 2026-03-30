import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../translations';

const ArjunIntroScreen = () => {
  const navigate = useNavigate();
  const { selectedLanguage } = useGame();
  const [currentSlide, setCurrentSlide] = useState(0);

  const t = getTranslation(selectedLanguage);
  const steps = t?.arjun?.steps || [];

  const storyData = [
    { text: steps[0]?.text || "Hey! I'm Arjun! 👋", icon: "👦🏽", pop: steps[0]?.pop || "WHOOSH!" },
    { text: steps[1]?.text || "I just came from science class and my mind is BLOWN 🤯", icon: "🤯", pop: steps[1]?.pop || "BOOM!" },
    { text: steps[2]?.text || "My teacher said — every time we use electricity, a power plant burns coal...", icon: "🏭", pop: steps[2]?.pop },
    { text: steps[3]?.text || "...and releases 0.710 kg of CO₂ for EVERY single unit!", icon: "☁️", pop: steps[3]?.pop || "0.710 kg!" },
    { text: steps[4]?.text || "Fans spinning. Fridge humming. AC blasting. I saw my house differently.", icon: "🔌", pop: steps[4]?.pop },
    { text: steps[5]?.text || "How much CO₂ is MY home producing? 🤔", icon: "🏠", pop: steps[5]?.pop },
    { text: steps[6]?.text || "I'm going to find out. And I'm going to FIX it.", icon: "⚡", pop: steps[6]?.pop || "POWER UP!" },
    { text: steps[7]?.text || "Will you join my mission? 🚀", icon: "🚀", pop: steps[7]?.pop || "HERO MODE ACTIVATED!" }
  ].filter(slide => slide.text);

  const handleNext = () => {
    if (currentSlide < storyData.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/video');
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #050a15 0%, #0a1628 100%)',
        color: 'white'
      }}
    >
      <div className="w-full max-w-2xl text-center flex flex-col items-center">
        
        {/* Story Area container */}
        <div className="w-full min-h-[400px] relative flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              {storyData[currentSlide]?.icon && (
                <motion.div 
                  className="text-7xl mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                >
                  {storyData[currentSlide].icon}
                </motion.div>
              )}
              
              <h2 className="text-2xl md:text-4xl font-bold leading-relaxed text-white drop-shadow-md">
                {storyData[currentSlide]?.text}
              </h2>

              {storyData[currentSlide]?.pop && (
                <motion.div
                  className="mt-8 text-[#22c55e] font-black text-2xl md:text-3xl tracking-widest uppercase italic drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                >
                  {storyData[currentSlide].pop}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-3 mt-10 mb-8">
          {storyData.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-colors duration-300 ${
                index === currentSlide 
                  ? "bg-[#22c55e]" 
                  : index < currentSlide
                    ? "bg-[#22c55e]/50"
                    : "bg-gray-600"
              }`}
              animate={{
                width: index === currentSlide ? 40 : 12
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          className="px-10 py-4 bg-[#22c55e] text-black font-black text-xl md:text-2xl rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:bg-[#2ae06b] transition-all w-full max-w-sm uppercase tracking-wide"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentSlide === storyData.length - 1 ? (t?.arjun?.nextMission || "NEXT MISSION →") : "Next →"}
        </motion.button>

      </div>
    </div>
  );
};

export default ArjunIntroScreen;
