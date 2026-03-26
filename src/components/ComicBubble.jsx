import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ComicBubble = ({ text, isVisible = true }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={text}
          initial={{ scale: 0, originX: 0.5, originY: 1 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative inline-flex items-center justify-center h-[80px]"
        >
          <div 
            className="bg-white text-gray-900 border-2 border-gray-900 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] z-10 relative flex items-center justify-center text-center leading-tight"
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontFamily: 'Fredoka, sans-serif',
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)',
              borderRadius: '6px',
              maxWidth: '280px',
              minWidth: '200px'
            }}
          >
            {text}
          </div>
          
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[14px] border-t-white border-r-[10px] border-r-transparent z-20" />
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-gray-900 border-r-[12px] border-r-transparent z-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComicBubble;
