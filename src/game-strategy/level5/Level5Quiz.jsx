// ═══════════════════════════════════════════════════════════
//  LEVEL 5 — Quiz (Scenario-Based)
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

  const handleSelect = useCallback(i => {
    if (sel !== null) return;
    setSel(i);
    setShowExp(true);
    if (i === q.correctIndex) setScore(s => s + 1);
  }, [sel, q]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= total) { onComplete({ score: score + (sel === q.correctIndex ? 0 : 0), total }); return; }
    setIdx(c => c + 1); setSel(null); setShowExp(false);
  }, [idx, total, score, sel, q, onComplete]);

  if (!q) return null;

  return (
    <div className="l5-quiz-container">
      <div className="l5-quiz-card">
        <div className="l5-quiz-progress">{L5.brain} Question {idx + 1} of {total}</div>
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
          <button className="l5-quiz-next-btn" onClick={handleNext}>{idx + 1 >= total ? 'Finish Quiz' : 'Next'} {'\u{2192}'}</button>
        </>)}
      </div>
    </div>
  );
}
