// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Extended Quiz (10 Questions, Scenario-Based)
// ═══════════════════════════════════════════════════════════
import React, { useState, useCallback } from 'react';
import { L5_QUIZ, L5 } from './level5Data';

export default function Level5Quiz({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [showExp, setShowExp] = useState(false);

  const q = L5_QUIZ[idx];
  const total = L5_QUIZ.length;
  const isCorrect = sel === q?.correctIndex;
  const progress = ((idx + 1) / total) * 100;

  const handleSelect = useCallback(i => {
    if (sel !== null) return;
    setSel(i);
    setShowExp(true);
    if (i === q.correctIndex) setScore(s => s + 1);
  }, [sel, q]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) { onComplete({ score, total }); return; }
    setIdx(c => c + 1); setSel(null); setShowExp(false);
  }, [idx, total, score, onComplete]);

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
            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
            borderRadius: 2, transition: 'width 0.5s ease',
          }}></div>
        </div>

        <div className="l5-quiz-question">{q.question}</div>
        <div className="l5-quiz-options">
          {q.options.map((opt, i) => {
            let cls = 'l5-quiz-option';
            if (sel !== null) { if (i === q.correctIndex) cls += ' correct'; else if (i === sel) cls += ' wrong'; }
            return <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={sel !== null}>{opt}</button>;
          })}
        </div>
        {showExp && (<>
          <div className="l5-quiz-explanation">
            {isCorrect ? <><strong>{L5.check} Excellent!</strong> {q.explanation}</> : <><strong>{L5.cross} Not quite.</strong> {q.explanation}</>}
          </div>

          {/* Score tracker */}
          <div style={{
            textAlign: 'center', fontSize: 12, color: '#888', margin: '8px 0',
          }}>
            Score: {score + (isCorrect ? 0 : 0)}/{idx + 1} correct
          </div>

          <button className="l5-quiz-next-btn" onClick={handleNext}>{idx + 1 >= total ? 'Finish Quiz' : 'Next'} {'\u{2192}'}</button>
        </>)}
      </div>
    </div>
  );
}
