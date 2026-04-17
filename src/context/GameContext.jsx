import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// ─── localStorage helpers ───
function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(`sustained_${key}`);
    if (stored !== null) return JSON.parse(stored);
  } catch (e) {}
  return fallback;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(`sustained_${key}`, JSON.stringify(value));
  } catch (e) {}
}

export const GameProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [carbonCoins, setCarbonCoins] = useState(() => loadFromStorage('carbonCoins', 0));
  const [completedLevels, setCompletedLevels] = useState(() => loadFromStorage('completedLevels', []));
  const [currentLevel, setCurrentLevel] = useState(() => loadFromStorage('currentLevel', 1));

  // ─── Persist to localStorage on change ───
  useEffect(() => { saveToStorage('carbonCoins', carbonCoins); }, [carbonCoins]);
  useEffect(() => { saveToStorage('completedLevels', completedLevels); }, [completedLevels]);
  useEffect(() => { saveToStorage('currentLevel', currentLevel); }, [currentLevel]);

  const addCarbonCoins = (amount) => setCarbonCoins((prev) => prev + amount);
  
  const completeLevel = (levelId) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels(prev => [...prev, levelId]);
    }
  };

  const unlockLevel = (levelId) => {
    if (levelId > currentLevel) {
      setCurrentLevel(levelId);
    }
  };

  const value = {
    selectedLanguage,
    setSelectedLanguage,
    language: selectedLanguage,
    carbonCoins,
    addCarbonCoins,
    completedLevels,
    completeLevel,
    currentLevel,
    unlockLevel,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
