// ═══════════════════════════════════════════════════════════
//  LevelIntro — "Learn Before Play" Shared Component
//  Used by ALL levels (1–5) with level-specific data via props
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import './LevelIntro.css';

// ─── Level Color Themes ───
const LEVEL_COLORS = {
  1: { accent: '#22c55e', glow: 'rgba(34,197,94,0.4)', gradient: 'linear-gradient(135deg, #052e16 0%, #0a1628 50%, #064e3b 100%)' },
  2: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.4)', gradient: 'linear-gradient(135deg, #451a03 0%, #0a1628 50%, #78350f 100%)' },
  3: { accent: '#ef4444', glow: 'rgba(239,68,68,0.4)', gradient: 'linear-gradient(135deg, #450a0a 0%, #0a1628 50%, #7f1d1d 100%)' },
  4: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.4)', gradient: 'linear-gradient(135deg, #422006 0%, #0a1628 50%, #713f12 100%)' },
  5: { accent: '#3b82f6', glow: 'rgba(59,130,246,0.4)', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0a1628 50%, #1e3a5f 100%)' },
};

export default function LevelIntro({ levelNumber, levelTitle, levelIcon, objective, learningOutcome, terms, onComplete, accentColor }) {
  const [phase, setPhase] = useState('objective'); // 'objective' | 'concepts'
  const [cardIndex, setCardIndex] = useState(0);
  const [animState, setAnimState] = useState('enter'); // 'enter' | 'exit'
  const [showContent, setShowContent] = useState(false);

  const colors = LEVEL_COLORS[levelNumber] || LEVEL_COLORS[1];
  const accent = accentColor || colors.accent;

  // Fade-in animation on mount
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Handle card slide transition
  const handleNextCard = () => {
    if (cardIndex < terms.length - 1) {
      setAnimState('exit');
      setTimeout(() => {
        setCardIndex(i => i + 1);
        setAnimState('enter');
      }, 300);
    } else {
      // Last card done
      onComplete();
    }
  };

  const handleStartConcepts = () => {
    setPhase('concepts');
    setCardIndex(0);
    setAnimState('enter');
  };

  const handleSkip = () => {
    onComplete();
  };

  // ═══ PHASE 1: Objective Screen ═══
  if (phase === 'objective') {
    return (
      <div className="li-overlay" style={{ background: colors.gradient }}>
        <div className="li-particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="li-particle" style={{
              '--x': `${Math.random() * 100}%`,
              '--delay': `${Math.random() * 3}s`,
              '--duration': `${2 + Math.random() * 3}s`,
              '--color': accent,
            }} />
          ))}
        </div>

        <div className={`li-objective-container ${showContent ? 'visible' : ''}`}>
          {/* Level Badge */}
          <div className="li-level-badge" style={{ borderColor: accent, boxShadow: `0 0 30px ${colors.glow}` }}>
            <span className="li-badge-icon">{levelIcon}</span>
            <span className="li-badge-label" style={{ color: accent }}>LEVEL {levelNumber}</span>
          </div>

          {/* Level Title */}
          <h1 className="li-title" style={{ textShadow: `0 0 20px ${colors.glow}` }}>{levelTitle}</h1>

          {/* Objective Card */}
          <div className="li-info-card">
            <div className="li-card-header">
              <span className="li-card-icon" style={{ color: accent }}>🎯</span>
              <span className="li-card-label">OBJECTIVE</span>
            </div>
            <p className="li-card-text">{objective}</p>
          </div>

          {/* Learning Outcome Card */}
          <div className="li-info-card">
            <div className="li-card-header">
              <span className="li-card-icon" style={{ color: accent }}>🧠</span>
              <span className="li-card-label">LEARNING OUTCOME</span>
            </div>
            <p className="li-card-text">{learningOutcome}</p>
          </div>

          {/* Buttons */}
          <button className="li-primary-btn" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }} onClick={handleStartConcepts}>
            Start Level →
          </button>
          <button className="li-skip-btn" onClick={handleSkip}>
            Skip (I know this) ▸
          </button>
        </div>
      </div>
    );
  }

  // ═══ PHASE 2: Concept Cards ═══
  const currentTerm = terms[cardIndex];
  const isLast = cardIndex === terms.length - 1;

  return (
    <div className="li-overlay" style={{ background: colors.gradient }}>
      <div className="li-particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="li-particle" style={{
            '--x': `${Math.random() * 100}%`,
            '--delay': `${Math.random() * 3}s`,
            '--duration': `${2 + Math.random() * 3}s`,
            '--color': accent,
          }} />
        ))}
      </div>

      <div className="li-concepts-container">
        {/* Header */}
        <div className="li-concepts-header">
          <span className="li-concepts-label" style={{ color: accent }}>📖 Key Concepts</span>
          <span className="li-concepts-level">Level {levelNumber}</span>
        </div>

        {/* Card */}
        <div className={`li-term-card ${animState}`} key={cardIndex}>
          <div className="li-term-icon" style={{ textShadow: `0 0 20px ${colors.glow}` }}>{currentTerm.icon}</div>
          <h2 className="li-term-name" style={{ color: accent }}>{currentTerm.name}</h2>
          <p className="li-term-def">{currentTerm.definition}</p>
          {currentTerm.example && (
            <div className="li-term-example">
              <span className="li-example-label">💡 Example:</span>
              <span>{currentTerm.example}</span>
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="li-progress-dots">
          {terms.map((_, i) => (
            <div key={i} className={`li-dot ${i === cardIndex ? 'active' : i < cardIndex ? 'done' : ''}`}
              style={i === cardIndex ? { background: accent, boxShadow: `0 0 8px ${colors.glow}` } : {}} />
          ))}
        </div>

        {/* Buttons */}
        <button className="li-primary-btn" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }} onClick={handleNextCard}>
          {isLast ? 'Start Learning →' : 'Next →'}
        </button>
        <button className="li-skip-btn" onClick={handleSkip}>
          Skip (I know this) ▸
        </button>
      </div>
    </div>
  );
}
