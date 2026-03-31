import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import './Level2.css';

import Step1Discovery from './Step1Discovery';
import Step2BarChart from './Step2BarChart';
import Step3Formula from './Step3Formula';
import Step4Ranking from './Step4Ranking';
import Step5BillSim from './Step5BillSim';
import QuizModal from './QuizModal';
import RewardScreen from './RewardScreen';

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'Discovery',
  'Bar Chart',
  'Formula',
  'Ranking',
  'Bill Sim',
];

export default function Level2() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel } = useGame();

  const [phase, setPhase] = useState('entry'); // entry | steps | quiz | reward
  const [currentStep, setCurrentStep] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [quizResult, setQuizResult] = useState(null);

  const handleScore = useCallback((pts) => {
    setTotalScore(s => s + pts);
  }, []);

  const handleStepComplete = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(s => s + 1);
    } else {
      setPhase('quiz');
    }
  }, [currentStep]);

  const handleQuizComplete = useCallback((result) => {
    setQuizResult(result);
    setPhase('reward');
  }, []);

  const handleContinue = useCallback((coins) => {
    addCarbonCoins(coins);
    completeLevel(2);
    unlockLevel(3);
    navigate('/hub');
  }, [addCarbonCoins, completeLevel, unlockLevel, navigate]);

  // ─── Entry Scene ───
  if (phase === 'entry') {
    return (
      <div className="l2-container">
        <div className="l2-entry-overlay">
          <div className="l2-flash-icon">{'\u{26A1}'}</div>
          <h1 className="l2-entry-title">The Energy Meter</h1>
          <p className="l2-entry-subtitle">How Hungry Are Your Appliances?</p>
          <div className="l2-dialogue-box">
            <p className="l2-dialogue-text">
              {'\u{1F9D1}\u{200D}\u{1F393}'} "Let's see how much electricity these appliances consume! 
              Every device at home has a hidden appetite for energy. Time to find out who's the hungriest!"
            </p>
          </div>
          <button className="l2-start-btn" onClick={() => setPhase('steps')}>
            Begin Level 2 {'\u{2192}'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz Phase ───
  if (phase === 'quiz') {
    return (
      <div className="l2-container">
        <QuizModal onComplete={handleQuizComplete} />
      </div>
    );
  }

  // ─── Reward Phase ───
  if (phase === 'reward' && quizResult) {
    return (
      <div className="l2-container">
        <RewardScreen
          stars={quizResult.stars}
          score={quizResult.score}
          total={quizResult.total}
          pct={quizResult.pct}
          totalScore={totalScore}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  // ─── Steps Phase ───
  const progressPct = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="l2-container">
      {/* HUD */}
      <div className="l2-hud">
        <button className="l2-back-btn" onClick={() => navigate('/hub')}>
          {'\u{2190}'} Back
        </button>
        <span className="l2-level-title">{'\u{26A1}'} The Energy Meter</span>
        <span className="l2-step-badge">
          Step {currentStep}/{TOTAL_STEPS}: {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="l2-progress-wrapper">
        <div className="l2-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Content */}
      <div className="l2-content" key={currentStep}>
        {currentStep === 1 && (
          <Step1Discovery onComplete={handleStepComplete} onScore={handleScore} />
        )}
        {currentStep === 2 && (
          <Step2BarChart onComplete={handleStepComplete} onScore={handleScore} />
        )}
        {currentStep === 3 && (
          <Step3Formula onComplete={handleStepComplete} onScore={handleScore} />
        )}
        {currentStep === 4 && (
          <Step4Ranking onComplete={handleStepComplete} onScore={handleScore} />
        )}
        {currentStep === 5 && (
          <Step5BillSim onComplete={handleStepComplete} onScore={handleScore} />
        )}
      </div>
    </div>
  );
}
