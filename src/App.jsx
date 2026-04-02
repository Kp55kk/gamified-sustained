import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameProvider } from './context/GameContext';

import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import ArjunIntroScreen from './screens/ArjunIntroScreen';
import VideoScreen from './screens/VideoScreen';
import HubScreen from './screens/HubScreen';
import Level1 from './game-strategy/Level1';
import Level2 from './game-strategy/level2/Level2';
import Level3 from './game-strategy/level3/Level3';
import Level4 from './game-strategy/level4/Level4';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/language" element={<LanguageScreen />} />
        <Route path="/intro" element={<ArjunIntroScreen />} />
        <Route path="/video" element={<VideoScreen />} />
        <Route path="/hub" element={<HubScreen />} />
        <Route path="/level1" element={<Level1 />} />
        <Route path="/level2" element={<Level2 />} />
        <Route path="/level3" element={<Level3 />} />
        <Route path="/level4" element={<Level4 />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div 
          className="relative w-full min-h-screen overflow-hidden text-white selection:bg-[#22c55e] selection:text-black m-0 p-0"
          style={{ 
            fontFamily: 'Nunito, sans-serif',
            background: 'linear-gradient(135deg, #050a15 0%, #0a1628 100%)'
          }}
        >
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
