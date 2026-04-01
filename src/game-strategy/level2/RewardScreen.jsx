import React from 'react';
import { LEVEL2_BADGE, ENERGY_TIPS } from './level2Data';

export default function RewardScreen({ stars, score, total, pct, totalScore, onContinue }) {
  const coinsEarned = LEVEL2_BADGE.coins + (stars * 10) + totalScore;
  const impactMsg = ENERGY_TIPS[Math.floor(Math.random() * ENERGY_TIPS.length)];

  return (
    <div className="l2-reward-overlay">
      <div className="l2-reward-card">
        {/* Badge */}
        <div className="l2-reward-badge">{LEVEL2_BADGE.icon}</div>
        <div className="l2-reward-title">{LEVEL2_BADGE.title}</div>
        <div className="l2-reward-subtitle">{LEVEL2_BADGE.description}</div>

        {/* Stars */}
        <div className="l2-reward-stars">
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`l2-reward-star ${s <= stars ? 'earned' : 'empty'}`}
              style={{ animationDelay: `${s * 0.3}s` }}
            >
              {'\u{2B50}'}
            </span>
          ))}
        </div>

        {/* Quiz Score */}
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
          Quiz: {score}/{total} correct ({pct}%)
        </div>

        {/* Carbon Coins */}
        <div className="l2-reward-coins">
          <span className="l2-reward-coins-icon">{'\u{1FA99}'}</span>
          <span className="l2-reward-coins-text">+{coinsEarned} Carbon Coins</span>
        </div>

        {/* Energy Impact */}
        <div className="l2-reward-impact">
          <div className="l2-reward-impact-text">
            {'\u{1F331}'} {impactMsg}
          </div>
        </div>

        {/* Continue */}
        <button className="l2-continue-btn" onClick={() => onContinue(coinsEarned)}>
          Return to Hub {'\u{2192}'}
        </button>
      </div>
    </div>
  );
}
