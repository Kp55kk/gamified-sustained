import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const VideoScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const handleVideoEnd = () => {
    navigate('/hub');
  };

  const handleSkip = () => {
    navigate('/hub');
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Show skip button after 2 seconds
    setTimeout(() => setShowSkip(true), 2000);
  };

  useEffect(() => {
    // Auto-start video on mount
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setTimeout(() => setShowSkip(true), 2000);
      }).catch(() => {
        // Autoplay blocked, user will need to click play
        setIsPlaying(false);
      });
    }
  }, []);

  return (
    <motion.div
      className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      transition={{ duration: 0.8 }}
    >
      {/* Video Element — always rendered, hidden until playing */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${isPlaying ? 'block' : 'hidden'}`}
        playsInline
        onEnded={handleVideoEnd}
        onPlay={handlePlay}
      >
        <source src="/assets/videos/chapter1-intro.mp4" type="video/mp4" />
      </video>

      {/* Pre-play overlay — click to start video */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px]"
                style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
              />
            </div>

            <motion.div
              className="relative z-10 text-center flex flex-col items-center justify-center p-8 bg-[#0a1628]/90 backdrop-blur-xl rounded-2xl border-2 shadow-[0_0_40px_rgba(34,197,94,0.25)] w-full max-w-lg mx-4"
              style={{ borderColor: '#22c55e' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Play icon */}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5 cursor-pointer border-2"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderColor: '#22c55e',
                  boxShadow: '0 0 30px rgba(34,197,94,0.4), inset 0 0 15px rgba(255,255,255,0.2)',
                }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(34,197,94,0.6)' }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(34,197,94,0.3)',
                    '0 0 40px rgba(34,197,94,0.6)',
                    '0 0 20px rgba(34,197,94,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                  }
                }}
              >
                <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
                  <path d="M4 2L30 18L4 34V2Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </motion.div>

              <h2
                className="text-3xl mb-2 font-bold tracking-wide text-white"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                Chapter 1 Intro
              </h2>
              <p className="text-[#9ca3af] mb-6 text-sm">
                Tap play to begin the chapter video
              </p>

              <motion.button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                  }
                }}
                className="px-8 py-3 rounded-xl font-bold tracking-wide transition-all text-white text-lg"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ▶ PLAY VIDEO
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button Overlay — appears after 2s of playback */}
      <AnimatePresence>
        {isPlaying && showSkip && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            onClick={handleSkip}
            className="absolute bottom-6 right-6 px-5 py-2.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-white flex items-center gap-2 hover:bg-white/10 transition-colors z-50 text-sm"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Skip Intro ⏭
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoScreen;
