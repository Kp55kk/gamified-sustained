// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — Phase Router
//  Phase 1: "Understand the Consequences of Energy Use"
//  Phase 2: Coming Soon (placeholder)
// ═══════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import LevelIntro from '../LevelIntro';
import Phase1 from './phase1/Phase1';
import Phase2 from './phase2/Phase2';

export default function Level3() {
  const navigate = useNavigate();
  const { addCarbonCoins, completeLevel, unlockLevel } = useGame();

  const [levelPhase, setLevelPhase] = useState('phase1');
  const [showLevelIntro, setShowLevelIntro] = useState(true);

  // ═══════════════════════════════════════════════════════
  //  RENDER — LEVEL INTRO (Learn Before Play)
  // ═══════════════════════════════════════════════════════
  if (showLevelIntro) {
    return (
      <LevelIntro
        levelNumber={3}
        levelTitle="Energy Consequences"
        levelIcon="🔥"
        objective="Discover what happens when you overuse electricity. Turn ON appliances, watch the environment degrade, and learn to fix the damage you create. Every action has a consequence!"
        learningOutcome="By the end of this phase, you will understand how energy overuse affects temperature, CO₂ levels, air quality, and electricity bills — and how smart choices can reduce the damage."
        terms={[
          {
            icon: '🌡️',
            name: 'Heat Loop',
            definition: 'A vicious cycle where AC use heats the outside, making cities hotter, requiring even more AC. Also called the Urban Heat Island effect.',
            example: 'Your AC pumps heat outside → city gets hotter → you need more AC',
          },
          {
            icon: '🌍',
            name: 'CO₂ Emissions',
            definition: 'Carbon dioxide released when electricity is generated from coal or gas. More electricity = more CO₂ = more climate change.',
            example: 'Running AC all day produces ~3.5 kg CO₂ — equivalent to driving 15 km',
          },
          {
            icon: '💰',
            name: 'Energy Cost',
            definition: 'The money you pay for electricity. High-watt appliances like AC and Geyser create the biggest bills.',
            example: 'AC at 18°C costs 40% more than at 24°C for the same cooling',
          },
        ]}
        onComplete={() => setShowLevelIntro(false)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — PHASE 1: Interactive Consequences
  // ═══════════════════════════════════════════════════════
  if (levelPhase === 'phase1') {
    return (
      <Phase1
        onComplete={() => {
          // Phase 1 complete — award coins and move to Phase 2
          addCarbonCoins(50);
          setLevelPhase('phase2');
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER — PHASE 2: Placeholder (Coming Soon)
  // ═══════════════════════════════════════════════════════
  if (levelPhase === 'phase2') {
    return (
      <Phase2
        onComplete={() => {
          completeLevel(3);
          unlockLevel(4);
          navigate('/hub');
        }}
      />
    );
  }

  return null;
}
