import React, { useState, useEffect } from 'react';
import { APPLIANCES } from './level2Data';

const chartAppliances = [...APPLIANCES]
  .filter(a => typeof a.wattage === 'number')
  .sort((a, b) => b.wattage - a.wattage)
  .slice(0, 10);

const maxWattage = chartAppliances[0]?.wattage || 1;

export default function Step2BarChart({ onComplete, onScore }) {
  const [phase, setPhase] = useState('predict'); // predict | reveal
  const [prediction, setPrediction] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [barWidths, setBarWidths] = useState(chartAppliances.map(() => 0));

  const handlePredict = (appId) => {
    setPrediction(appId);
  };

  const handleReveal = () => {
    setPhase('reveal');
    // Stagger bar animations
    chartAppliances.forEach((app, i) => {
      setTimeout(() => {
        setBarWidths(prev => {
          const next = [...prev];
          next[i] = (app.wattage / maxWattage) * 100;
          return next;
        });
      }, i * 200);
    });
    setTimeout(() => setRevealed(true), chartAppliances.length * 200 + 500);

    // Check prediction
    const correctId = chartAppliances[0].id;
    if (prediction === correctId) {
      onScore(20);
    }
  };

  const isCorrect = prediction === chartAppliances[0]?.id;

  return (
    <div className="l2-step-transition">
      <div className="l2-section-header">
        <span className="l2-section-icon">{'\u{1F4CA}'}</span>
        <h2 className="l2-section-title">Power Comparison</h2>
        <p className="l2-section-desc">
          {phase === 'predict'
            ? 'Which appliance do you think has the HIGHEST wattage? Make your prediction!'
            : 'Here\u2019s how appliances compare by wattage. Did you guess correctly?'}
        </p>
      </div>

      {phase === 'predict' && (
        <>
          <div className="l2-prediction-grid">
            {chartAppliances.map(app => (
              <div
                key={app.id}
                className={`l2-prediction-card ${prediction === app.id ? 'selected' : ''}`}
                onClick={() => handlePredict(app.id)}
              >
                <div className="l2-prediction-icon">{app.icon}</div>
                <div className="l2-prediction-name">{app.name}</div>
              </div>
            ))}
          </div>
          <button
            className="l2-check-btn"
            disabled={!prediction}
            onClick={handleReveal}
            style={{ display: 'block', margin: '0 auto' }}
          >
            {'\u{1F50D}'} Reveal Chart
          </button>
        </>
      )}

      {phase === 'reveal' && (
        <>
          {revealed && (
            <div className={`l2-prediction-result ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect
                ? `${'\u{2705}'} Excellent! You correctly predicted the ${chartAppliances[0].name} is the highest! +20 points`
                : `${'\u{274C}'} Not quite! The ${chartAppliances[0].name} (${chartAppliances[0].wattage}W) has the highest wattage.`}
            </div>
          )}

          <div className="l2-chart-container">
            {chartAppliances.map((app, i) => (
              <div
                key={app.id}
                className="l2-chart-row"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="l2-chart-label">
                  <span>{app.icon}</span>
                  <span>{app.name.length > 15 ? app.name.slice(0, 15) + '...' : app.name}</span>
                </div>
                <div className="l2-chart-bar-wrapper">
                  <div
                    className="l2-chart-bar"
                    style={{
                      width: `${barWidths[i]}%`,
                      background: app.color || '#3b82f6',
                    }}
                  >
                    <span className="l2-chart-bar-value">{app.wattage}W</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {revealed && (
            <button
              className="l2-continue-btn"
              onClick={onComplete}
              style={{ display: 'block', margin: '24px auto 0' }}
            >
              Continue {'\u{2192}'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
