import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [carbonCoins, setCarbonCoins] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);

  const addCarbonCoins = (amount) => setCarbonCoins((prev) => prev + amount);
  
  const completeLevel = (levelId) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels([...completedLevels, levelId]);
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

