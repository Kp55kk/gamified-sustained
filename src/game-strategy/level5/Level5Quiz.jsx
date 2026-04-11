// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Reflection Quiz (Hidden Style — No ✅/❌)
//  Narrative feedback only, experience-based questions
// ═══════════════════════════════════════════════════════════
import React, { useState, useCallback } from 'react';
import { L5_QUIZ, L5 } from './level5Data';

export default function Level5Quiz({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const q = L5_QUIZ[idx];
  const total = L5_QUIZ.length;
  const isCorrect = sel !== null && sel === q?.correctIndex;
  const progress = ((idx + 1) / total) * 100;

  const handleSelect = useCallback(i => {
    if (sel !== null) return;
    setSel(i);
    setShowFeedback(true);
    if (i === q.correctIndex) setScore(s => s + 1);
  }, [sel, q]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) { onComplete({ score, total }); return; }
    setIdx(c => c + 1); setSel(null); setShowFeedback(false);
  }, [idx, total, score, onComplete]);

  if (!q) return null;

  return (
    <div className="l5-quiz-container">
      <div className="l5-quiz-card">
        <div className="l5-quiz-progress">
          {L5.brain} Reflection {idx + 1} of {total}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.08)',
          borderRadius: 2, marginBottom: 14, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
            borderRadius: 2, transition: 'width 0.5s ease',
          }}></div>
        </div>

        <div className="l5-quiz-question">{q.question}</div>

        {/* Options — NO correct/wrong coloring */}
        <div className="l5-sim-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`l5-sim-option ${sel === i ? 'selected' : ''}`}
              onClick={() => handleSelect(i)}
              disabled={sel !== null}
            >
              <span className="l5-sim-option-icon">{L5.play}</span>
              <span className="l5-sim-option-label">{opt}</span>
            </button>
          ))}
        </div>

        {/* Narrative feedback — no ✅/❌ */}
        {showFeedback && (<>
          <div className="l5-narrative-feedback" style={{ marginTop: 12 }}>
            <div className="l5-narrative-icon">{L5.speech}</div>
            <div className="l5-narrative-text">
              {isCorrect ? q.feedback.correct : q.feedback.wrong}
            </div>
          </div>

          <button className="l5-quiz-next-btn" onClick={handleNext}>
            {idx + 1 >= total ? 'Finish Reflection' : 'Next'} {'\u{2192}'}
          </button>
        </>)}
      </div>
    </div>
  );
}
