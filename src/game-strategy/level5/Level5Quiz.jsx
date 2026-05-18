// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Quiz (Green/Red Feedback + Explanations)
//  Shows correct/wrong with color + detailed explanation
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
    if (idx + 1 >= total) { onComplete({ score: score + (sel === q.correctIndex ? 0 : 0), total }); return; }
    setIdx(c => c + 1); setSel(null); setShowFeedback(false);
  }, [idx, total, score, sel, q, onComplete]);

  if (!q) return null;

  return (
    <div className="l5-quiz-container">
      <div className="l5-quiz-card">
        <div className="l5-quiz-progress">
          {L5.brain} Question {idx + 1} of {total}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.08)',
          borderRadius: 2, marginBottom: 14, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            borderRadius: 2, transition: 'width 0.5s ease',
          }}></div>
        </div>

        <div className="l5-quiz-question">{q.question}</div>

        {/* Options with correct/wrong coloring */}
        <div className="l5-sim-options">
          {q.options.map((opt, i) => {
            let cls = '';
            if (sel !== null) {
              if (i === q.correctIndex) cls = 'correct';
              else if (i === sel) cls = 'wrong';
            }
            return (
              <button
                key={i}
                className={`l5-sim-option ${sel === i ? 'selected' : ''} ${cls}`}
                onClick={() => handleSelect(i)}
                disabled={sel !== null}
              >
                <span className="l5-sim-option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="l5-sim-option-label">{opt}</span>
                {sel !== null && i === q.correctIndex && <span className="l5-sim-option-check">{'\u2705'}</span>}
                {sel !== null && i === sel && i !== q.correctIndex && <span className="l5-sim-option-check">{'\u274C'}</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation feedback */}
        {showFeedback && (<>
          <div className={`l5-quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            <div className="l5-quiz-feedback-header">
              <span className="l5-quiz-feedback-icon">{isCorrect ? '\u2705' : '\u274C'}</span>
              <span className="l5-quiz-feedback-status">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <div className="l5-quiz-feedback-text">
              {isCorrect ? q.feedback.correct : q.feedback.wrong}
            </div>
          </div>

          <button className="l5-quiz-next-btn" onClick={handleNext}>
            {idx + 1 >= total ? `See Results ${'\u2192'}` : `Next Question ${'\u2192'}`}
          </button>
        </>)}
      </div>
    </div>
  );
}
